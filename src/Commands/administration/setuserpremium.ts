import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class SetUserPremiumCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'setuserpremium',
            group: 'administration',
            desc: 'Выдает пользователю премиум на месяц',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Set User Premium', 'Упомяните пользователя').response(),
                ],
            });
        const getUserPremium = await this.client.provider.getUser(member.id, 'premium');
        if (!getUserPremium.status) {
            getUserPremium.status = true;
            getUserPremium.end = Date.now() + 2592000000;
            await this.client.provider.setUser(member.id, 'premium', getUserPremium);
        } else {
            getUserPremium.end = getUserPremium.end + 2592000000;
            await this.client.provider.setUser(member.id, 'premium', getUserPremium);
        }
        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'Set User Premium',
                    'Выдал пользователю премиум на месяц',
                ).response(),
            ],
        });
    }
}
