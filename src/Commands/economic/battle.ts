import { GuildMember, Message, User } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';
import { IUserStats } from '../../Interface';

export default class BattleCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'battle',
            group: 'economic',
            desc: 'сражение с другим пользовательм за деньги (50/50 шанс)',
            format: '@User <money>',
            example: '@TestUser#4131 5000',
            checksystem: 'economic',
        });
    }
    async execute(message: Message, args: string[]) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Battle', `Вы не упомянули пользователя`).response(),
                ],
            });

        if (target.presence.status === 'offline' || target.presence.status === 'idle')
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Battle',
                        `Пользователь не в сети или отошел`,
                    ).response(),
                ],
            });

        if (message.author.id === target.id)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Battle', 'Нельзя сражаться самим с собой').response(),
                ],
            });

        if (target.user.bot)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Battle', 'Нельзя сражаться с ботом').response()],
            });

        const count = Number(args[1]);
        if (!count || isNaN(count))
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Battle', 'Введите сумму ставки').response()],
            });
        if (count > 5000)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Battle', 'Ставка ограничена 5000').response()],
            });
        const userload = await this.client.economic.findOrCreate(message.member);
        const targetload = await this.client.economic.findOrCreate(target);

        if (userload.coins < count)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Battle', 'У вас нет столько денег').response()],
            });

        if (targetload.coins < count)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Battle', `У ${target} нет такой суммы`).response(),
                ],
            });
        this.start(message, target, count, userload, targetload);
    }
    async start(
        message: Message,
        target: GuildMember,
        price: number,
        userload: IUserStats,
        targetload: IUserStats,
    ) {
        const filter = (m: Message) => m.author.id === target.id;
        await message.channel.send(
            `${target}, Вас вызвал на битву ${message.author}, чтобы принять её, напишите \`!accept\`,а чтобы отклонить\`!cancel\``,
        );
        await message.channel
            .awaitMessages({
                filter,
                max: 1,
                time: 40000,
                errors: ['time'],
            })
            .then(async (collected) => {
                if (collected.first().content.toLowerCase() === '!cancel') {
                    const color = 'RED';
                    const title = 'Battle';
                    const desc = `${message.author}, ${target} отменил битву с Вами!`;
                    return message.channel.send({
                        embeds: [new Infomessage(color, title, desc).response()],
                    });
                }
                if (collected.first().content.toLowerCase() === '!accept') {
                    const chance = Math.floor(Math.random() * (2 - 1 + 1)) + 0;
                    if (chance === 0) {
                        userload.coins += price;
                        targetload.coins -= price;
                        await this.client.economic.saveAllProfile(message.guild);
                        const color = 'GREEN';
                        const title = 'Battle';
                        const desc = `${message.author}, поздравляю, Вы победили в схватке!\n${target}, Вы проиграли, ничего страшного, повезёт в следующий раз!`;
                        return message.channel.send({
                            embeds: [new Infomessage(color, title, desc).response()],
                        });
                    } else {
                        userload.coins -= price;
                        targetload.coins += price;
                        await this.client.economic.saveAllProfile(message.guild);
                        const color = 'GREEN';
                        const title = 'Battle';
                        const desc = `${target}, поздравляю, Вы победили в схватке!\n${message.author}, Вы проиграли, ничего страшного, повезёт в следующий раз!`;
                        return message.channel.send({
                            embeds: [new Infomessage(color, title, desc).response()],
                        });
                    }
                }
            })
            .catch((e) => {
                return message.reply('Время вышло');
            });
    }
}
