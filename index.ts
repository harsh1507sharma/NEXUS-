#!/usr/bin/env bun
// shebang hia upar wali line => This line allows the script to be run directly from the command line using Bun, which is a JavaScript runtime similar to Node.js. It tells the system to use Bun to execute the script.

import {Command} from 'commander';
import {Run} from "./TUI/start.js";

const program = new Command();

program
.name("Nexus")
.description("A powerful AI agent framework built on top of LangSmith.")
.version("1.0.0");

program
.command("Start")
.description("Show the banner and pick the modes")
.action(
    async() => {
    await Run()
    // Here you can add code to display the banner and prompt the user to select a mode
});
await program.parseAsync(process.argv);



