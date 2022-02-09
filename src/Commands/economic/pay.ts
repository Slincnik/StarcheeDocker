import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class PayCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'pay',
            group: 'economic',
            checksystem: 'economic',
            cooldown: 5,
            desc: 'Перевод денег на балланс другому пользователю',
        });
    }
    async execute(message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Pay', 'Упомяните пользователя').response()],
            });
        if (member.user.bot)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Pay', 'Пользователь не должен быть ботом').response(),
                ],
            });
        if (member.id === message.author.id)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Pay', 'Нельзя перевести самому себе').response()],
            });
        const sentAmmount = Number(args[1]);
        if (!sentAmmount || isNaN(sentAmmount))
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Pay',
                        'Введите количество денег для передачи',
                    ).response(),
                ],
            });
        const MemberData = await this.client.economic.findOrCreate(member);
        const UserData = await this.client.economic.findOrCreate(message.member);
        if (sentAmmount > UserData.coins)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Pay', 'У вас недостаточно средств').response()],
            });
        UserData.coins -= sentAmmount;
        MemberData.coins += sentAmmount;
        await this.client.economic.saveAllProfile(message.guild);
        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'Pay',
                    `Успешно перевел ${sentAmmount} пользователю ${member}`,
                ).response(),
            ],
        });
    }
}
