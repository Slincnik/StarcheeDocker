import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class RestartCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'restart',
            group: 'administration',
            desc: 'Перезагружает бота',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        message.reply('Перезагружаю бота').then(() => {
            return process.exit(1);
        });
    }
}
