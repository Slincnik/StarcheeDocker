import { TextChannel } from 'discord.js';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ClearCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'clear',
            group: 'moderation',
            desc: 'Очищает чат от команд бота',
            lvl: 'Moder',
            format: 'clear <1-100>',
            example: '10',
        });
    }
    async execute(message: Message, args: string[]) {
        const prefix = this.client.provider.getGuild(message.guild.id, 'prefix');
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Clear',
                        `Введите кол-во сообщений для удаления`,
                    ).response(),
                ],
            });
        }
        const count = Number(args[0]);
        if (Number.isFinite(args[0]))
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clear', 'Вы ввели не число!').response()],
            });
        if (count > 100 || count <= 0) {
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clear', 'Введите корректное значение').response()],
            });
        }
        await message.delete();
        const fetched = await message.channel.messages.fetch({
            limit: count,
        });
        const filtered = fetched.filter(
            (e) => e.author.equals(this.client.user) || e.content.startsWith(prefix),
        );
        if (!filtered.size)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clear', 'Нету сообщений').response()],
            });
        (message.channel as TextChannel)
            .bulkDelete(filtered)
            .then(async (msg) => {
                message.channel
                    .send({
                        embeds: [
                            new Infomessage(
                                'GREEN',
                                'Clear',
                                `Было удаленно сообщений - **${msg.size}**`,
                            ).response(),
                        ],
                    })
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 5000);
                    });
            })
            .catch((e) => {
                if (e.message === 'Unknown Message') return;
                message.channel.send({
                    embeds: [
                        new Infomessage(
                            'RED',
                            'Clear',
                            `Произошла ошибка. Повторите позже`,
                        ).response(),
                    ],
                });
                return console.error(e);
            });
    }
}
