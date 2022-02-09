import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Mute from '../../Classes/Mute';
import Client from '../../Client';

export default class UnmuteCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'unmute',
            desc: 'удаляет человека из мута',
            group: 'moderation',
            clientPermissions: ['MANAGE_ROLES', 'BAN_MEMBERS'],
            // userPermissions: ['MANAGE_ROLES', 'BAN_MEMBERS'],
            example: '@User',
            lvl: 'Moder',
        });
    }
    async execute(message: Message, args: string[]) {
        const newmuteconf = this.client.provider.getBotsettings('botconfs', 'mutes');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Unmute', 'Вы не упомянули пользователя').response(),
                ],
            });

        if (!newmuteconf[member.id])
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Unmute',
                        'Пользователь не находиться в муте!',
                    ).response(),
                ],
            });

        if (newmuteconf[member.id].guild !== message.guild.id) return;
        this.client.mute.UnmuteMember(member.id);
    }
}
