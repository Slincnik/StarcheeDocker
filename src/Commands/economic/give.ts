import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class GiveCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'give',
            group: 'economic',
            checksystem: 'economic',
            desc: 'Выдача опыта/денег пользователю',
            lvl: 'Moder',
        });
    }
    async execute(message: Message, args: string[]) {
        const argType = args[0];
        if (!argType)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Give', 'Введите чего именно добавить').response()],
            });
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
        if (!member)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Give', 'Упомяните пользователя').response()],
            });
        if (argType === 'coins') {
            const giveAmmount = Number(args[2]);
            if (!giveAmmount || isNaN(giveAmmount))
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Give', 'Введите количество монет').response()],
                });
            const memberData = await this.client.economic.findOrCreate(member);
            memberData.coins += giveAmmount;
            await this.client.economic.saveAllProfile(message.guild);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'Give',
                        `Успешно выдал ${member} ${giveAmmount} монет`,
                    ).response(),
                ],
            });
        } else if (argType === 'exp') {
            const giveAmmount = Number(args[2]);
            if (!giveAmmount || isNaN(giveAmmount))
                return message.channel.send({
                    embeds: [new Infomessage('RED', 'Give', 'Введите количество опыта').response()],
                });
            const memberData = await this.client.economic.findOrCreate(member);
            memberData.exp += giveAmmount;
            await this.client.economic.saveAllProfile(message.guild);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'Give',
                        `Успешно выдал ${member} ${giveAmmount} опыта`,
                    ).response(),
                ],
            });
        } else
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Give', 'Введите чего именно добавить').response()],
            });
    }
}
