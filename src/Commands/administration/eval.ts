import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';
import { inspect } from 'util';

export default class EvalCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'eval',
            desc: 'Making an Eval command',
            group: 'administration',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args[0])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Eval', 'Введите коамнду').response()],
            });
        const clean = (text: string) => {
            if (typeof text === 'string')
                return text
                    .replace(/`/g, '`' + String.fromCharCode(8203))
                    .replace(/@/g, '@' + String.fromCharCode(8203));
            else return text;
        };
        try {
            const code = args.join(' ');
            // tslint:disable-next-line: no-eval
            let evaled = eval(code);
            if (typeof evaled !== 'string') evaled = inspect(evaled);
            message.channel.send({ content: clean(evaled) });
        } catch (error) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
        }
    }
}
