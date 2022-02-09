import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ListwordsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'listwords',
            group: 'moderation',
            desc: 'Показывает список слов',
            lvl: 'Moder',
            checksystem: 'filter',
        });
    }
    async execute(message: Message, _args: string[]) {
        const array = [];
        const chatfilter = this.client.provider.getGuild(message.guild.id, 'chatfilter');
        if (!chatfilter.array.length) return message.channel.send('Чат-фильтр пуст!');

        for (const word of chatfilter.array) {
            array.push(word);
        }

        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'ListWords',
                    `50 слов из листа: \n ${array.slice(0, 50).join(', ')}`,
                ).response(),
            ],
        });
    }
}
