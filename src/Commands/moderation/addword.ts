import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class AddwordCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'addword',
            group: 'moderation',
            desc: 'Добавляет слово(ва)',
            lvl: 'Moder',
            checksystem: 'filter',
            example: 'addword [kurwa, epta]',
        });
    }
    async execute(message: Message, args: string[]) {
        const chatfilter = this.client.provider.getGuild(message.guild.id, 'chatfilter');
        const replace = /\[(.*?)\]/ims;
        const matches = replace.exec(message.content);
        if (!matches || !matches[1])
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'AddWord',
                        `Usage: ${this.options.name} [words]`,
                    ).response(),
                ],
            });
        const WordInArray = [];
        const newchatfilterarray = matches[1].toLowerCase().replace(/\s/g, '').split(',');
        for (const word of newchatfilterarray) {
            const WordArray = chatfilter.array.includes(word);
            if (WordArray) WordInArray.push(word);
        }
        const msg = await message.channel.send({
            embeds: [new Infomessage('YELLOW', 'AddWord', 'Начал добавлять слова').response()],
        });
        const result = await Promise.all(
            newchatfilterarray
                .filter((x) => !WordInArray.includes(x))
                .map((x) => chatfilter.array.push(x)),
        );
        const succeeded = result.filter((x) => !(x instanceof Error)).length;
        const failed = result.filter((x) => x instanceof Error).length;
        if (failed)
            console.log(
                `AddWord: ${failed} кол-во не смог добавить слов в список [${message.guild.id}|${message.guild.name}]`,
            );
        if (succeeded) {
            await this.client.provider.setGuild(message.guild.id, 'chatfilter', chatfilter);
            return msg.edit({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'AddWord',
                        `Успешно добавил ${succeeded} слов`,
                    ).response(),
                ],
            });
        } else
            return msg.edit({
                embeds: [
                    new Infomessage(
                        'RED',
                        'AddWord',
                        `Данное слово(слова) уже есть в списке`,
                    ).response(),
                ],
            });
    }
}
