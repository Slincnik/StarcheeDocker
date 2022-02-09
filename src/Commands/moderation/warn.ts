import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class WarnCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'warn',
            aliases: ['wn'],
            desc: 'Добавляет/удаляет предупреждения',
            group: 'moderation',
            lvl: 'Moder',
            checksystem: 'warnings',
            example: 'add @User 2 bad man',
            format: 'add/remove @User',
        });
    }
    async execute(message: Message, args: string[]) {
        const client = this.client;
        const warnings = client.provider.getGuild(message.guild.id, 'warnings');
        const warn = warnings.list;
        if (!args.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Warn', 'Введите аргумент add/remove').response()],
            });
        if (args[0] === 'add') {
            const member =
                message.mentions.members.first() || message.guild.members.cache.get(args[1]);

            if (!member) {
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Warn', 'Не нашел пользователя').response()],
                });
            }
            const reason = args.slice(2).join(' ');
            if (!reason.length)
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Warn', 'Введите причину').response()],
                });

            if (!warn[member.id]) {
                warn[member.id] = {
                    reason: [],
                };
                warn[member.id].reason.push({
                    reason,
                    mod: message.author.id,
                });
            } else {
                warn[member.id].reason.push({
                    reason,
                    mod: message.author.id,
                });
            }
            console.log(
                `Warnings: Модератор [${message.author.username}](${message.author.id}) добавил пользователя [${member.user.username}](${member.id}) предупреждение по причине: ${reason}`,
            );
            await client.provider.setGuild(message.guild.id, 'warnings', warnings);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'Warn',
                        `Добавил пользователю ${member} предупреждение.\nПричина: ${reason}`,
                    ).response(),
                ],
            });
        } else if (args[0] === 'remove') {
            const member =
                message.mentions.members.first() || message.guild.members.cache.get(args[1]);

            if (!member) {
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Warn', 'Не нашел пользователя').response()],
                });
            }
            if (!warn[member.id].reason.length)
                return message.channel.send({
                    embeds: [
                        new Infomessage(
                            'RED',
                            'Warn',
                            'У пользователя нет предупреждений',
                        ).response(),
                    ],
                });

            if (!args[2])
                return message.channel.send({
                    embeds: [
                        new Infomessage(
                            'RED',
                            'Warn',
                            'Введите номер предупреждения, которое хотите удалить',
                        ).response(),
                    ],
                });

            const count = Number(args[2]);
            if (isNaN(count))
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Warn', 'Введено не число').response()],
                });

            if (warn[member.id].reason.length < count)
                return message.channel.send({
                    embeds: [
                        new Infomessage(
                            'RED',
                            'Warn',
                            'У пользователя нет столько предупреждений',
                        ).response(),
                    ],
                });

            try {
                warn[member.id].reason.splice(count - 1, 1);
                const color = 'GREEN';
                const title = 'Warnings';
                const text = `Удалил у пользователя ${member} предупреждение под номер ${count}`;
                console.log(
                    `Warnings: Модератор [${message.author.username}](${message.author.id}) удалил пользователю [${member.user.username}](${member.id}) предупреждение под номером ${count}`,
                );
                await client.provider.setGuild(message.guild.id, 'warnings', warnings);
                return message.channel.send({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            } catch (e) {
                message.channel.send('Произошла ошибка');
                return console.log(e);
            }
        } else {
            const color = 'RED';
            const title = 'Warnings';
            const text = 'Введите аргумент add/remove';
            return message.channel.send({
                embeds: [new Infomessage(color, title, text).response()],
            });
        }
    }
}
