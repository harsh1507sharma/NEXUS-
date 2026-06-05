import chalk from "chalk";
import {select, isCancel} from "@clack/prompts";
import { runAgent } from "./agents/orchestrator";
import { runAskMode } from "./ask/orchestrator";
import { createplan } from "./plan/orchestrator";

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
            await createplan();
        }
        else if(mode=='ask'){
            await runAskMode();
        }

        else if(mode!='Agent' && mode!='Plan' && mode!='ask'){
            console.log(chalk.red('Invalid selection. Please try again.'));
            await runcli();
        }

    }

}