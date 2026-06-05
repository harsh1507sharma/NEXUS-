import chalk from "chalk";
import { confirm, isCancel, text } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { getagentmodel } from "../../ai/aiconfig.ts";
import { ActionTracker } from "../agents/action-tracker.ts";
import { AgentExecutor } from "../agents/tool_executor.ts";
import { defaultAgentConfig } from "../agents/types.ts";
import { renderTerminalMarkdown } from "../../TUI/terminal-md.ts";
import { runapproval} from "../agents/approvalflow.ts";
import { generateplan } from "./generate.ts";
import { printPlan, selectSteps } from "./printplan.ts";
import type { PlanStep } from "./types.ts";
import { createAgentTools } from "../agents/agent-tools.ts";
import  { createWebTools } from "./web-scrapping.ts";


export async function createplan():Promise<void>{

function stepPrompt(goal: string, step: PlanStep): string {
  return [`Goal: ${goal}`, `Step: ${step.title}`, step.description].join('\n');
}

    console.log(chalk.bold.green("Welcome to the Plan Mode!"));

    const goal = await text({message: "Please enter your goal:"});

    if(isCancel(goal) || !goal.trim()){
        console.log(chalk.yellow("Plan creation cancelled."));
        return;
    }
    
    const plan = await generateplan(goal);

    printPlan(plan);

    const selected = await  selectSteps(plan);
    if (selected.length === 0) return;

    const proceed = await confirm({
    message: `Execute ${selected.length} step(s)`,
    initialValue: true,
    });

    
    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new AgentExecutor(config,tracker);

    const tools = {
      ...createAgentTools(executor),
      ...createWebTools(tracker),
    };

   
    for (const step of selected) {
    console.log(chalk.bold(`\n🔧 ${step.title}\n`));

    const agent = new ToolLoopAgent({
      model:getagentmodel(),
      stopWhen:stepCountIs(30),
      tools,
    });

    const r = await agent.generate({prompt:stepPrompt(plan.goal , step)})

    if(r.text) return console.log(renderTerminalMarkdown(r.text))

  }

  const ok = await runapproval(tracker);

  if(!ok) return executor.clearStaging();

   const { errors } = executor.applyApprovedFromTracker();
   if (errors.length) {
    console.log(chalk.red('\nSome operations reported errors:\n'));
for (const e of errors) console.log(chalk.red(`  • ${e}`));
  } else {
    console.log(chalk.green('\n✓ Applied.\n'));
  }
  executor.clearStaging();
}

