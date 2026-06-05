import {Telegraf} from 'telegraf';
import { isOwner } from './auth';
import { WelcomeMessage } from './constant';


export function registerhandlers(bot:Telegraf){

    bot.command('start', async (ctx) => {
        if(!isOwner(ctx.chat.id)) return;
        await ctx.reply(WelcomeMessage,{parse_mode:'Markdown'})
})
   
}  