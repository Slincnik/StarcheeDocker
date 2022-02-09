import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class RemoveStatsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'removestats',
            group: 'economic',
            checksystem: 'economic',
            desc: 'Удаляет статистику пользователя',
            lvl: 'Moder',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'RemoveStats', 'Упомяните пользователя').response(),
                ],
            });
        if (member.user.bot)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'RemoveStats', 'Вы упомянули бота').response()],
            });

        const currentUser = this.client.economic.getUser(member);
        if (!currentUser)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'RemoveStats',
                        'У пользователя нету аккаунта',
                    ).response(),
                ],
            });

        this.client.economic.removeUser(member);
        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'RemoveStats',
                    `Удалил статистику у пользователя ${member}`,
                ).response(),
            ],
        });
    }
}
