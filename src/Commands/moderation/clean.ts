import { Message, TextChannel } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class CleanCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'clean',
            group: 'moderation',
            desc: 'очищает чат',
            lvl: 'Moder',
            format: 'clean <1-100>',
            example: '10',
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Clean',
                        `Введите кол-во сообщений для удаления`,
                    ).response(),
                ],
            });
        }
        const count = Number(args[0]);
        if (Number.isFinite(args[0]))
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clean', 'Вы ввели не число!').response()],
            });
        if (count > 100 || count <= 0) {
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clean', 'Введите корректное значение').response()],
            });
        }
        const fetched = await message.channel.messages.fetch({
            limit: count,
        });
        if (!fetched.size)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Clean', 'Нету сообщений').response()],
            });
        (message.channel as TextChannel)
            .bulkDelete(fetched)
            .then(async (msg) => {
                message.channel
                    .send({
                        embeds: [
                            new Infomessage(
                                'GREEN',
                                'Clean',
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
                            'Clean',
                            `Произошла ошибка. Повторите позже`,
                        ).response(),
                    ],
                });
                return console.error(e);
            });
    }
}
