import {
  Output,
  extractJsonMiddleware,
  generateText,
  stepCountIs,
  tool,
  wrapLanguageModel,
} from "ai";
import { z } from "zod";
import chalk from "chalk";
import { getagentmodel } from "../../ai/aiconfig.ts";
import { ActionTracker } from "../agents/action-tracker.ts";
import { AgentExecutor } from "../agents/tool_executor.ts";
import {createask} from "../ask/orchestrator.ts";
import { defaultAgentConfig } from "../agents/types.ts";
import { renderTerminalMarkdown } from "../../TUI/terminal-md.ts";
import { runapproval} from "../agents/approvalflow.ts";
import type { Plan, PlanStep } from "../plan/types.ts";
import type { read } from "node:fs";

const planSchema = z.object({
  researchSummary: z.string(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        hints: z.array(z.string()),
        complexity: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(1)
    .max(15),
});

function readonlytool(executor: AgentExecutor){
  return{
                readFile:tool({
            description: "Read the content of a file given its relative path.",
            inputSchema: z.object({
                path: z.string().describe("The relative path to the file to read.")
            }),
            execute: async({ path }) => executor.readFile(path)
        }),
            list_files: tool({
      description: "List files and directories under a path.",
      inputSchema: z.object({
        path: z.string(),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path: p, recursive }) =>
        executor.listFiles(p, recursive),
        }),

            search_files: tool({
      description:
        'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
      inputSchema: z.object({
        root: z.string().describe("Directory to search, relative to root"),
        pattern: z
          .string()
          .describe("Glob-like pattern using * and ** (forward slashes)"),
        content_contains: z.string().optional(),
      }),
      execute: async ({ root, pattern, content_contains }) =>
        executor.searchFiles(root, pattern, content_contains),
        }),

            analyze_codebase: tool({
      description:
        "Summarize structure: file counts, size, extensions. Read-only.",
      inputSchema: z.object({
        path: z.string().default("."),
      }),
      execute: async ({ path: p }) => executor.analyzeCodebase(p),
        }),
            list_skills: tool({
      description:
        "List absolute paths to SKILL.md files under configured skill directories (Cursor / Claude).",
      inputSchema: z.object({}),
      execute: async () => executor.listSkills(),
        }),

             read_skill: tool({
      description:
        "Read a SKILL.md file. Path must be absolute and under skill roots, or use a path returned by list_skills.",
      inputSchema: z.object({
        path: z.string(),
      }),
      execute: async ({ path: p }) => executor.readSkill(p),
        }),

  }
}

const PLAN_INSTRUCTIONS = (codebase: string, hasWeb: boolean) =>
  [
    "You are a Plan-Mode planner. You DO NOT modify files.",
    `Workspace: ${codebase}`,
    "Use read-only tools for codebase/skills research.",
    hasWeb
      ? "Web tools are available (web_search/web_crawl/fetch_url). Use only when needed."
      : "Web tools are unavailable (no FIRECRAWL_API_KEY).",
    "Output must match the provided JSON schema.",
    "Keep it short: 1–15 steps.",
  ].join("\n");

  export async function generateplan(goal: string){
    const config = defaultAgentConfig();
    config.tools.allowFileCreation = true;
    config.tools.allowFileModification = false;
    config.tools.allowFolderCreation = false;
    config.tools.allowShellExecution = false;
    const tracker = new ActionTracker();
    const executor = new AgentExecutor(config, tracker);

    const hasWeb = false;
    const model = wrapLanguageModel({
    model:getagentmodel(),
    middleware:extractJsonMiddleware()
  })
    
    const tools = {...readonlytool(executor)};

    console.log(chalk.blue("Generating plan..."));

    const result = await generateText({
      model,
      tools,
      stopWhen : stepCountIs(20),
      system: PLAN_INSTRUCTIONS(config.codebasePath, hasWeb),
      prompt: `Goal: ${goal}`,
      output: Output.object({schema: planSchema}),
    })
    const validated = planSchema.parse(result.output);

    const steps:PlanStep[] = validated.steps.map((s,i)=>({
    id:`step-${i+1}`,
    title:s.title,
    description:s.description,
    hints:s.hints,
    complexity:s.complexity
    }));

    return {goal , researchSummary:validated.researchSummary ,steps}

  }