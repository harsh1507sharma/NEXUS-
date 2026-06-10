import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { isMutationType } from "./types";

const HISTORY_FILE_PATH = join(process.cwd(), ".nexus-history.json");

export interface HistorySession {
  timestamp: string;
  mode: string;
  goal: string;
  totalActions: number;
  committedMutations: {
    id: string;
    timestamp: string;
    type: string;
    path: string;
    status: string;
  }[];
}

/**
 * Saves the current session actions to .nexus-history.json.
 * Kept strictly type-safe and caps the history to the last 20 records.
 */
export function saveSessionToHistory(goal: string, mode: string, actions: any[]): void {
  let history: HistorySession[] = [];

  if (existsSync(HISTORY_FILE_PATH)) {
    try {
      const data = readFileSync(HISTORY_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        history = parsed;
      }
    } catch (e) {
      // Gracefully ignore reading errors and start with fresh history
    }
  }

  // Extract only mutations that have been approved (committed changes)
  const committedMutations = actions
    .filter((a) => a && isMutationType(a.type) && a.status === "approved")
    .map((a) => ({
      id: String(a.id),
      timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : new Date(a.timestamp).toISOString(),
      type: String(a.type),
      path: String(a.path),
      status: String(a.status),
    }));

  const newSession: HistorySession = {
    timestamp: new Date().toISOString(),
    mode,
    goal,
    totalActions: actions.length,
    committedMutations,
  };

  // Add to top of the history list
  history.unshift(newSession);

  // Slice to keep only the last 20 records
  history = history.slice(0, 20);

  try {
    writeFileSync(HISTORY_FILE_PATH, JSON.stringify(history, null, 2), "utf-8");
  } catch (e) {
    console.error(chalk.red("Failed to write session history to file:"), e);
  }
}

/**
 * Renders a highly polished terminal timeline of past sessions.
 */
export function displayHistoryCLI(): void {
  if (!existsSync(HISTORY_FILE_PATH)) {
    console.log(chalk.yellow("\nNo session history found. Start a session first!\n"));
    return;
  }

  let history: HistorySession[] = [];
  try {
    const data = readFileSync(HISTORY_FILE_PATH, "utf-8");
    history = JSON.parse(data);
  } catch (e) {
    console.log(chalk.red("\nError reading history file or file is corrupted.\n"));
    return;
  }

  if (history.length === 0) {
    console.log(chalk.yellow("\nNo sessions recorded in history.\n"));
    return;
  }

  console.log(chalk.bold.cyan("\n┌────────────────────────────────────────────────────────┐"));
  console.log(chalk.bold.cyan("│                   NEXUS SESSION HISTORY                │"));
  console.log(chalk.bold.cyan("└────────────────────────────────────────────────────────┘\n"));

  history.forEach((session, index) => {
    const sessionNum = String(history.length - index).padStart(2, "0");
    const dateStr = new Date(session.timestamp).toLocaleString();
    const modeLabel = chalk.magenta.bold(`[${session.mode}]`);
    
    console.log(
      chalk.cyan(`[${sessionNum}]`),
      modeLabel,
      chalk.gray(`•  ${dateStr}`)
    );
    console.log(`     ${chalk.bold("Goal:")} "${chalk.italic.white(session.goal)}"`);
    console.log(`     ${chalk.bold("Total Actions:")} ${chalk.yellow(session.totalActions)}`);
    console.log(`     ${chalk.bold("Committed Modifications:")}`);

    if (session.committedMutations.length === 0) {
      console.log(`       ${chalk.gray("- (No modifications committed)")}`);
    } else {
      session.committedMutations.forEach((mut) => {
        const typeColor =
          mut.type === "file_create"
            ? chalk.green
            : mut.type === "file_delete"
            ? chalk.red
            : chalk.blue;
        
        console.log(
          `       ${chalk.green("✓")} ${typeColor(`[${mut.type}]`)} ${chalk.underline(mut.path)}`
        );
      });
    }
    
    if (index < history.length - 1) {
      console.log(chalk.gray("\n  ──────────────────────────────────────────────────────\n"));
    }
  });
  console.log();
}
