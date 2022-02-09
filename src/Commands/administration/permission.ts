import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class PermissionCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'permission',
            group: 'administration',
            aliases: ['perm'],
            desc: 'Удалегие/добавление прав у бота, так же показ списка',
            format: 'add/remove/list @User#4444 moder',
            lvl: 'Admin',
        });
    }
    async execute(message: Message, args: string[]) {
        const permload = this.client.provider.getGuild(message.guild.id, 'perms');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
        if (!args[0]) {
            const color = 'RED';
            const title = 'Permission';
            const text = 'Выберите, `add`, `remove` или `list`';
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        }
        if (args[0] === 'add') {
            if (!member) {
                const color = 'RED';
                const title = 'Permission';
                const text = 'Упомините человека';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            if (!args[2]) {
                const color = 'RED';
                const title = 'Permission';
                const text = 'Какие права установить пользователю, moder или admin';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            if (args[2].toLowerCase() === 'moder') {
                const settings = {
                    role: 'Moder',
                };
                permload[member.id] = settings;
                await this.client.provider.setGuild(message.guild.id, 'perms', permload);
                const color = 'GREEN';
                const title = 'Permission';
                const text = `Добавил ${member.user.tag} права модера`;
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            } else if (args[2].toLowerCase() === 'admin') {
                const settings = {
                    role: 'Admin',
                };
                permload[member.id] = settings;
                await this.client.provider.setGuild(message.guild.id, 'perms', permload);
                const color = 'GREEN';
                const title = 'Permission';
                const text = `Добавил ${member.user.tag} права админа`;
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            } else {
                const color = 'RED';
                const title = 'Permission';
                const text = 'Какие права установить пользователю, moder или admin';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
        } else if (args[0] === 'remove') {
            if (!member) {
                if (isNaN(Number(args[1]))) {
                    const color = 'RED';
                    const title = 'Permission';
                    const text = 'Введите корректный ID человека';
                    return message.reply({
                        embeds: [new Infomessage(color, title, text).response()],
                    });
                }
            }
            if (!permload[member ? member.id : args[1]]) {
                const color = 'RED';
                const title = 'Permission';
                const text = 'У данного человека нет прав';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            delete permload[member ? member.id : args[1]];
            await this.client.provider.setGuild(message.guild.id, 'perms', permload);
            const color = 'GREEN';
            const title = 'Permission';
            const text = `Удалил у ${member ? member.user.tag : `${args[1]}`} права`;
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        } else if (args[0] === 'list') {
            let textik = '';
            // tslint:disable-next-line: forin
            for (const key in permload) {
                textik += `\nУ пользователя <@${key}> роль ${permload[key].role}`;
            }
            if (!textik.length) {
                const color = 'GREEN';
                const title = 'Permission';
                const text = 'Ни у кого нет прав';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            } else {
                const color = 'GREEN';
                const title = 'Permission';
                const text = textik;
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
        } else {
            const color = 'RED';
            const title = 'Permission';
            const text = 'Выберите, `add`, `remove` или `list`';
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        }
    }
}
