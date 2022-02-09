import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class SlotsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'slots',
            cooldown: 5,
            aliases: ['slot', 'casino'],
            checksystem: 'economic',
            group: 'economic',
            desc: 'Обычные тройные слоты',
        });
    }
    async execute(message: Message, args: string[]) {
        const slot = [
            ':custard:',
            ':candy:',
            ':cake:',
            ':icecream:',
            ':lollipop:',
            ':chocolate_bar:',
            ':moneybag:',
            // ':shaved_ice:',
            // ':doughnut:',
            // ':cookie:',
            // ':ice_cream:'
        ];

        const currentUser = await this.client.economic.findOrCreate(message.member); // Получение эконом.статистики пользователя
        const lcoins = Number(args[0]); // Количество монет которое отнимается за проигрыш
        if (!lcoins || isNaN(lcoins))
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Slots', 'Введите кол-во монет для ставки').response(),
                ],
            });
        const wcoins = (lcoins * 2) * 100 + (lcoins * 2); // Количество монет которое дается за победу

        if (currentUser.coins < lcoins)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Slots',
                        `${message.member}, у вас недостаточно средств!`,
                    ).response(),
                ],
            });

        const reels = [];
        for (let i = 0; i < 3; i++) {
            reels.push(slot[Math.floor(Math.random() * slot.length)]);
        }

        let result = {
            text: `Прости, но ты проиграл. И с твоего счета списалось ${lcoins} монет`
        };
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            currentUser.coins += wcoins;
            await this.client.economic.saveAllProfile(message.guild);
            result.text = `Ты победил. И тебе на счёт поступили ${wcoins} коинов!`;
        } else {
            currentUser.coins -= lcoins;
            await this.client.economic.saveAllProfile(message.guild);
        }
        const embed = new MessageEmbed()
            .setTitle(`Slot Machine - ${message.author.username}`)
            .setDescription(reels.join(' | '))
            .setFooter(result);
        message.channel.send({ embeds: [embed] });
    }
}
