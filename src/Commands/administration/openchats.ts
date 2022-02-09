import { CategoryChannel, Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class OpenChatsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'openchats',
            group: 'administration',
            desc: 'Добавляет права писать вообщения во всех чатах которые находятся в категории',
            lvl: 'Admin',
        });
    }
    async execute(message: Message, args: string[]) {
        const categories = message.guild.channels.cache.filter((c) => c.type === 'GUILD_CATEGORY');
        if (!categories.size) {
            return message.reply({ content: 'Нету категорий с каналами' });
        }
        categories.forEach(async (v) => {
            (v as CategoryChannel).permissionOverwrites.edit(message.guild.roles.everyone, {
                SEND_MESSAGES: true,
            });
        });
        return message.reply({ content: 'Добавил у всех канал право писать' });
    }
}
