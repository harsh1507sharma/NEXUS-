import {isCancel,text} from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { AgentExecutor } from "./tool_executor.ts";
import { createAgentTools } from "./agent-tools.ts";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getagentmodel } from "../../ai/index.ts";
import { renderTerminalMarkdown } from "../../TUI/terminal-md.ts";
import { runapproval } from "./approvalflow.ts";
import { saveSessionToHistory } from "./history.ts";

export async function runAgent(){
    console.log(chalk.green("Welcome to the Agent Mode!"));

    const goal  = await text({
        message: "What is your goal?",
        placeholder: "Enter your goal here...",
    }); 

    if (isCancel(goal) || goal.trim() === "") {
        console.log(chalk.yellow("Goal input cancelled. Exiting..."));
        return;
    }

    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new AgentExecutor(config, tracker);
    const tools = createAgentTools(executor);

    const agent = new ToolLoopAgent({
    model: getagentmodel(),
    stopWhen:  stepCountIs(40),
    instructions: [
      `Workspace root: ${config.codebasePath}`,
      "All mutations are staged until approval.",
    ].join("\n"),
     tools,
    });

    const result = await agent.generate({
    prompt: goal.trim(),
    onStepFinish: ({ toolCalls }) => {
      for (const tc of toolCalls) {
        const preview = JSON.stringify(tc.input).slice(0, 160);
        console.log(
          chalk.green("  ✓"),
          chalk.bold(String(tc.toolName)),
          chalk.dim(preview + (preview.length >= 160 ? "..." : "")),
        );
      }
    },
  });

  if(result.text?.trim()){
    console.log(chalk.blue("Agent Result:"));
    console.log(renderTerminalMarkdown(result.text));
  }

  const ok = await runapproval(tracker);

  if(!ok) {
    saveSessionToHistory(goal.trim(), "CLI", tracker.getActions());
    return executor.clearStaging();
  }

  const applyResult = executor.applyApprovedFromTracker();

  if(applyResult.errors.length){
    console.log(chalk.red("Errors applying changes:")); 
    for(const err of applyResult.errors){
        console.log(chalk.red("- " + err));
    }
  } else {
    console.log(chalk.green("All approved changes have been applied successfully!"));
  }

  saveSessionToHistory(goal.trim(), "CLI", tracker.getActions());
  executor.clearStaging();

} 