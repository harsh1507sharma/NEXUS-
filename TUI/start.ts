import {select, isCancel} from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import {runcli} from "../modes/cli.ts";
import {runtelegram} from "../modes/telegram/index.ts";

const BANNER_FONT = 'ANSI Shadow';
const SHADOW = chalk.hex('#FF5733'); // Example color for the banner text
const FACE = chalk.hex('#C70039').bold; // Example color for the banner text

function printBannerWithShadow(ascii: string) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}// banner print and drawing function

export async function Run() {

    let ascii : string;
    try{
        ascii = figlet.textSync('Nexus', {font: BANNER_FONT});
    }
    catch(error){
        ascii = figlet.textSync('Nexus', {font: 'Standard'});
    }

    printBannerWithShadow(ascii);

    const mode = await select({
        message: 'Select a mode:',
        options: [{ value: 'cli', label: 'CLI ' },
                 { value: 'telegram', label: 'Telegram' },
                 { value: 'autopilot', label: 'Autopilot AI (Advanced)' },
                 { value: 'cancel', label: 'Cancel' }
        ]
        });

        if(isCancel(mode)){
            console.log(chalk.red('No mode selected. Exiting...'));
            process.exit(0);
        }


        if(mode=='cli'){
            // console.log(chalk.green('You selected CLI mode!'));
            await runcli();
        }
        else if(mode=='telegram'){
            await runtelegram();
        }
        else if(mode=='autopilot'){
            console.log(chalk.green('You selected Autopilot AI mode!'));
        }
        
        else if(mode=='cancel'){
            console.log(chalk.red('No mode selected. Exiting...'));
            process.exit(0);
        }


}