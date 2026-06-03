import chalk from "chalk";
import {select, isCancel} from "@clack/prompts";
import { runAgent } from "./agents/orchestrator";

export async function runcli(){

    while(true){

      const mode = await select({
        message: 'Choose a CLI mode:',
        options: [{ value:'Agent',label:'Agent CLI' },
                 { value: 'Plan', label: 'Plan CLI' },
                 { value: 'ask', label: 'Ask CLI' },
                 { value: 'back', label: '<- Back to Main Menu' }
        ]
        });

        if(isCancel(mode)||mode=='back') return;

        else if(mode=='Agent'){
            await runAgent();
        }  
        else if(mode=='Plan'){
            console.log(chalk.green('You selected Plan CLI mode!'));
        }
        else if(mode=='ask'){
            console.log(chalk.green('You selected Ask CLI mode!'));
        }

        else if(mode!='Agent' && mode!='Plan' && mode!='ask'){
            console.log(chalk.red('Invalid selection. Please try again.'));
            await runcli();
        }

    }

}