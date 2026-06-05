import chalk from "chalk";
import { register } from "node:module";
import { Telegraf } from "telegraf";
import { WelcomeMessage } from "./constant.ts";
import { registerhandlers } from "./handlers.ts";

export async function runtelegram() {

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const ownerId = process.env.TELEGRAM_OWNER_ID;

    if(!token || !ownerId){
        console.log(chalk.red('Telegram bot token or owner ID not found in environment variables. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_ID in your .env file.'));
        return;
    }

    const bot = new Telegraf(token);

    registerhandlers(bot);

    await bot.telegram.sendMessage(ownerId, WelcomeMessage ,{parse_mode:'Markdown'});
    console.log(chalk.green('Telegram bot is running!'));

    bot.launch();
    console.log(chalk.green('Telegram bot launched successfully!'));

    await new Promise<void>((resolve) => {
    const stop = () => {
      bot.stop("SIGINT");
      resolve();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });

}