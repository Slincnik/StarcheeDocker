import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ClearStatsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'clearstats',
            group: 'economic',
            checksystem: 'economic',
            desc: 'Очищает экономическую статистку на сервере',
            lvl: 'Admin',
        });
    }
    async execute(message: Message, args: string[]) {
        const currentUsersys = await this.client.provider.fetchGuild(
            message.guild.id,
            'usersystem',
        );
        const currentScores = currentUsersys.stats;
        const ScoresSize = Object.keys(currentScores).length;
        if (ScoresSize) {
            try {
                for (const prop of Object.keys(currentScores)) {
                    delete currentScores[prop];
                }
                await this.client.economic.saveAllProfile(message.guild);
                return message.channel.send({
                    embeds: [
                        new Infomessage(
                            'GREEN',
                            'ClearStats',
                            'Очистил статистику сервера',
                        ).response(),
                    ],
                });
            } catch (e) {
                console.log(e);
                return message.reply('Произошла ошибка, попробуйте позже');
            }
        } else
            return message.channel.send({
                embeds: [new Infomessage('RED', 'ClearStats', 'Она пуста').response()],
            });
    }
}
