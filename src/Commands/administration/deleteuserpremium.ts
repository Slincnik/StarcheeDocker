import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class DeleteUserPremiumCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'deleteuserpremium',
            group: 'administration',
            desc: '[xatfy]',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return;
        const getUserPremium = await this.client.provider.getUser(member.id, 'premium');
        if (!getUserPremium.status) return;
        getUserPremium.end = 0;
        getUserPremium.status = false;
        await this.client.provider.setUser(member.id, 'premium', getUserPremium);

        return message.reply('ok');
    }
}
