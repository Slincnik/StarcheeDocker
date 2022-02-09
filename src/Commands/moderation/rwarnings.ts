import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ClearWarningsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'rwarnings',
            aliases: ['rwarn'],
            group: 'moderation',
            checksystem: 'warnings',
            lvl: 'Admin',
            desc: 'Удаляет все предупреждения',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        const warn = this.client.provider.getGuild(message.guild.id, 'warnings');
        const warnings = warn.list;
        if (!member)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'ClearWarnings', 'Упомянитель пользователя').response(),
                ],
            });

        if (!warnings[member.id])
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'ClearWarnings',
                        'У пользователя нету предупреждений',
                    ).response(),
                ],
            });

        try {
            warnings[member.id].reason.splice(0, warnings[member.id].reason.length);
            await this.client.provider.setGuild(message.guild.id, 'warnings', warn);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'ClearWarnings',
                        `У ${member} удалены всё предупреждения`,
                    ).response(),
                ],
            });
        } catch (error) {
            return message.reply(`Случилась ошибка: ${error.message}`);
        }
    }
}
