import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class BlacklistCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'blacklist',
            desc: 'добавляет человека в чёрный список не имея возможности использовать команды бота',
            group: 'administration',
            lvl: 'Admin',
            format: 'blacklist {add/delete} {@User}',
            example: ['add @Yes#4444', 'delete @Yes#4444'],
        });
    }
    async execute(message: Message, args: string[]) {
        const blacklist = this.client.provider.getGuild(message.guild.id, 'blacklist');
        if (!args[0])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Blacklist', `Введите add/delete`).response()],
            });
        if (args[0] === 'add') {
            if (!args[1])
                return message.channel.send({
                    embeds: [
                        new Infomessage('RED', 'Blacklist', `Упомяните пользователя`).response(),
                    ],
                });

            const color2 = 'YELLOW';
            const title2 = 'Blacklist';
            const msg = await message.channel.send({
                embeds: [new Infomessage('YELLOW', 'Blacklist', 'Ожидание...').response()],
            });
            const resolvedUser =
                message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (resolvedUser.id === message.author.id)
                return msg.edit({
                    embeds: [
                        new Infomessage(
                            color2,
                            title2,
                            '**Ошибка: Вы не можете добавить в чёрный список самого себя**',
                        ).response(),
                    ],
                });
            if (resolvedUser.user.bot)
                return msg.edit({
                    embeds: [
                        new Infomessage(
                            color2,
                            title2,
                            '**Ошибка: Вы не можете занести в черный список бота.**',
                        ).response(),
                    ],
                });
            const color = 'GREEN';
            const title = 'Blacklist';
            const desc = `✅ Успешно добавил пользователя ${resolvedUser.user.tag} в чёрный список`;
            if (blacklist.includes(resolvedUser.id)) {
                msg.edit({
                    embeds: [
                        new Infomessage(
                            'RED',
                            title,
                            '**Ошибка: Этот пользователь уже находится в чёрном списке.**',
                        ).response(),
                    ],
                });
            } else {
                blacklist.push(resolvedUser.id);
                await this.client.provider.setGuild(message.guild.id, 'blacklist', blacklist);
                return msg.edit({ embeds: [new Infomessage(color, title, desc).response()] });
            }
        } else if (args[0] === 'delete') {
            if (!args[1])
                return message.channel.send({
                    embeds: [
                        new Infomessage('RED', 'Blacklist', `Упомяните пользователя`).response(),
                    ],
                });
            const title2 = 'Blacklist';
            const desc2 = 'Ожидание...';
            const msg = await message.channel.send({
                embeds: [new Infomessage('YELLOW', title2, desc2).response()],
            });
            const resolvedUser =
                message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            const title = 'Blacklist';
            const desc = `✅ Успешно убрал пользователя ${resolvedUser.user.tag} из чёрного списка`;
            if (blacklist.includes(resolvedUser.id)) {
                const index = blacklist.indexOf(resolvedUser.id);
                index !== -1
                    ? blacklist.splice(index, 1)
                    : msg.edit({
                          embeds: [
                              new Infomessage(
                                  'RED',
                                  title2,
                                  '**Произошла ошибка, попробуйте позже**',
                              ).response(),
                          ],
                      });
                await this.client.provider.setGuild(message.guild.id, 'blacklist', blacklist);
                return msg.edit({ embeds: [new Infomessage('GREEN', title, desc).response()] });
            } else {
                msg.edit({
                    embeds: [
                        new Infomessage(
                            'RED',
                            title2,
                            '**Ошибка: Этого пользователя нету в чёрном списке.**',
                        ).response(),
                    ],
                });
            }
        } else
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Blacklist', `Введите add/delete`).response()],
            });
    }
}
