import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class DeleteWordCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'deleteword',
            group: 'moderation',
            desc: 'Удаление слов из чат-фильтра',
            lvl: 'Moder',
            checksystem: 'filter',
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
                        'DeleteWord',
                        `Usage: ${this.options.name} [words]`,
                    ).response(),
                ],
            });
        const newchatfilterarray = matches[1].toLowerCase().replace(/\s/g, '').split(',');

        const result = await Promise.all(
            newchatfilterarray
                .filter((x) => chatfilter.array.includes(x))
                .map((x) => chatfilter.array.splice(chatfilter.array.indexOf(x), 1)),
        );
        const succeeded = result.filter((x) => !(x instanceof Error)).length;
        const failed = result.filter((x) => x instanceof Error).length;
        if (failed !== 0)
            console.log(
                `DeleteWord: ${failed} кол-во не смог добавить слов в список [${message.guild.id}|${message.guild.name}]`,
            );
        if (succeeded) {
            await this.client.provider.setGuild(message.guild.id, 'chatfilter', chatfilter);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'DeleteWord',
                        `Успешно удалил ${succeeded} из списка`,
                    ).response(),
                ],
            });
        } else {
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'DeteleWord',
                        `${
                            newchatfilterarray.length > 1
                                ? 'Этих слов нету в списке'
                                : 'Этого слова нету в списке'
                        }`,
                    ).response(),
                ],
            });
        }
    }
}
