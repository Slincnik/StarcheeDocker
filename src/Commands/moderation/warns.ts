import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class WarnsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'warns',
            desc: 'Показывает кол-во предупреждений',
            group: 'moderation',
            checksystem: 'warnings',
            example: '@User',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Warns', 'Упомяните пользователя').response()],
            });
        const warnings = this.client.provider.getGuild(message.guild.id, 'warnings');
        const warn = warnings.list;
        const warningcount = warnings.count;
        if (!warn[member.id] || !warn[member.id].reason.length)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'WarningsList',
                        `Количество предупреждений у ${member.user.tag}: **0**`,
                    ).response(),
                ],
            });
        let description = '';
        warn[member.id].reason.map((w: { mod: string; reason: string }, i: number) => {
            description += `\`${++i}\` | Moderator: ${
                message.guild.members.cache.get(w.mod).user.tag
            } \nReason: ${w.reason}\n`;
        });
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(
                        `${member.user.tag}'s warns ${
                            warn[member.id].reason.length
                        } < ${warningcount}`,
                    )
                    .setDescription(description)
                    .setColor('GREEN'),
            ],
        });
    }
}
