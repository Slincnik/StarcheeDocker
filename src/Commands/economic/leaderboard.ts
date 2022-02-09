import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

interface ICoins {
    coins: number;
    exp: number;
    lvl: number;
}

export default class LeaderboardCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'leaderboard',
            group: 'economic',
            checksystem: 'economic',
            aliases: ['lb'],
            example: 'coins',
            desc: 'Выводит таблицу топ 10 по уровню/монетам',
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args.length)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        this.options.name,
                        'Введите по какой критерии сортировать (coins или lvl)',
                    ).response(),
                ],
            });
        const currentScores = this.client.provider.getGuild(message.guild.id, 'usersystem').stats;
        if (args[0] === 'lvl') {
            const sortArray = this.sortToExp(currentScores);
            if (!sortArray.length)
                return message.channel.send({
                    embeds: [
                        new Infomessage('RED', 'Leaderboards', 'Недостаточно данных').response(),
                    ],
                });
            const embed = new MessageEmbed().setTitle('LvL leaderboards').setColor('GREEN');
            for (let i = 0; i < sortArray.length; i++) {
                // if (sortArray[i].coins === 0) continue;
                if (i === 10) break;
                const user = message.guild.members.cache.get(sortArray[i].id) || 'User left';
                embed.addField(
                    `${i + 1}. ${typeof user === 'string' ? user : user.user.tag}`,
                    `**LVL**: ${sortArray[i].lvl} \nExp:${sortArray[i].exp}`,
                );
            }
            embed.setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            });
            message.channel.send({ embeds: [embed] });
        } else if (args[0] === 'coins') {
            const sortArray = this.sortToMoney(currentScores);
            if (!sortArray.length)
                return message.channel.send({
                    embeds: [
                        new Infomessage('RED', 'Leaderboards', 'Недостаточно данных').response(),
                    ],
                });
            const embed = new MessageEmbed().setTitle('Coins leaderboards').setColor('GREEN');
            for (let i = 0; i < sortArray.length; i++) {
                if (sortArray[i].coins === 0) continue;
                if (i === 10) break;
                const user = message.guild.members.cache.get(sortArray[i].id) || 'User left';
                embed.addField(
                    `${i + 1}. ${typeof user === 'string' ? user : user.user.tag}`,
                    `**Coins**: ${sortArray[i].coins}`,
                );
            }
            embed.setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            });
            message.channel.send({ embeds: [embed] });
        }
    }
    sortToExp<T extends ICoins>(currentScores: any) {
        const arraysScores = Object.entries(currentScores)
            .map(([key, val]) => ({ ...(val as T), id: key }))
            .sort((a, b) => b.exp - a.exp)
            .slice(0, 10);
        return arraysScores;
    }
    sortToMoney<T extends ICoins>(currentScores: any) {
        const arraysScores = Object.entries(currentScores)
            .map(([key, val]) => ({ ...(val as T), id: key }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 10);
        return arraysScores;
    }
}
