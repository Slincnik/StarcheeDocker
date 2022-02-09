import { CategoryChannel, Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class CloseChatsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'closechats',
            group: 'administration',
            desc: 'Убирает права писать вообщения во всех чатах которые находятся в категории',
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
                SEND_MESSAGES: false,
            });
        });
        return message.reply({ content: 'Убрал у всех канал право писать' });
    }
}
