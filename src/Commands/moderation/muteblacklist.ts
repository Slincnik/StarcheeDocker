import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class MuteBlackListCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'muteblacklist',
            aliases: ['mutebl'],
            group: 'moderation',
            desc: 'добавляет/удаляет канал, где нельзя получить автомут от бота',
            lvl: 'Admin',
        });
    }
    async execute(message: Message, args: string[]) {
        const mute = this.client.provider.getGuild(message.guild.id, 'mute');
        const channel =
            message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (args[0] === 'add') {
            if (!channel) {
                const color = 'RED';
                const title = 'MuteBlackList';
                const text = 'Не нашел данный канал';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            if (channel.type !== 'GUILD_TEXT') {
                const color = 'RED';
                const title = 'MuteBlackList';
                const text = 'Выберите обычный текстовый чат';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            if (mute.channelblacklist.includes(channel.id)) {
                const color = 'RED';
                const title = 'MuteBlackList';
                const text = 'Данный чат уже находиться в списке';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            mute.channelblacklist.push(channel.id);
            await this.client.provider.setGuild(message.guild.id, 'mute', mute);
            const color = 'GREEN';
            const title = 'MuteBlackList';
            const text = 'Канал был успешно добавлен в список';
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        } else if (args[0] === 'remove') {
            if (!channel) {
                const color = 'RED';
                const title = 'MuteBlackList';
                const text = 'Не нашел данный канал';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            if (!mute.channelblacklist.includes(channel.id)) {
                const color = 'RED';
                const title = 'MuteBlackList';
                const text = 'Данного чата нету в списке';
                return message.reply({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            const index = mute.channelblacklist.indexOf(channel.id);
            if (index > -1) mute.channelblacklist.splice(index, 1);
            await this.client.provider.setGuild(message.guild.id, 'mute', mute);
            const color = 'GREEN';
            const title = 'MuteBlackList';
            const text = 'Канал был успешно удален из списка';
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        } else {
            const color = 'RED';
            const title = 'MuteBlackList';
            const text = 'Введите аргумент `add/remove`';
            return message.reply({
                embeds: [new Infomessage(color, title, text).response()],
            });
        }
    }
}
