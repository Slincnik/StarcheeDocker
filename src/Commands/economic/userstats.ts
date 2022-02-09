import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class UserStatsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'userstats',
            group: 'economic',
            checksystem: 'economic',
            desc: 'Показывает экономическую статистику вашего аккаунта',
        });
    }
    async execute(message: Message, args: string[]) {
        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.member;
        if (!member)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Userstats', 'Не нашел данного пользователя').response(),
                ],
            });
        if (member.user.bot)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Userstats', 'Вы упомянули бота').response()],
            });
        const currentUser = this.client.economic.getUser(member);
        if (!currentUser)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Userstats', 'У пользователя нету аккаунта').response(),
                ],
            });
        const getUserPremium = await this.client.provider.getUser(member.id, 'premium');
        const userLvl = currentUser.lvl;
        const next = this.checkExperience(userLvl) - currentUser.exp;
        const embed2 = new MessageEmbed()
            .setColor(0x00f910)
            .setAuthor({
                name: this.client.user.username,
                iconURL:
                    'https://thumbs.gfycat.com/FamousForkedEuropeanfiresalamander-size_restricted.gif',
            })
            .setTitle('UserStats')
            .addField('Монет', currentUser.coins.toString(), true)
            .addField('Лвл', currentUser.lvl.toString(), true)
            .addField('Exp', currentUser.exp.toString(), true)
            .addField('До след.уровня', next.toString(), true)
            .addField('Премиум статус', `${getUserPremium.status ? 'Да' : 'Нет'}`, true)
            // .addField(
            //     'Bar',
            //     this.progressBar(this.checkExperience(userLvl), currentUser.exp, 20) + '%',
            // )
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            })
            .setTimestamp();
        message.channel.send({ embeds: [embed2] });
    }
    checkExperience(level: number) {
        const y = ((Math.pow(level, 2) + level) / 2) * 100 - Math.pow(Math.E, 2);
        return Math.floor(y);
    }
    // progressBar(total: number, current: number, size = 40, line = '▬', slider = '🔘') {
    // 	if (!total) throw new Error('Total value is either not provided or invalid');
    // 	if (!current && current !== 0) throw new Error('Current value is either not provided or invalid');
    // 	if (isNaN(total)) throw new Error('Total value is not an integer');
    // 	if (isNaN(current)) throw new Error('Current value is not an integer');
    // 	if (isNaN(size)) throw new Error('Size is not an integer');
    // 	if (current > total) {
    // 		const bar = line.repeat(size + 2);
    // 		return bar;
    // 	} else {
    // 		const percentage = current / total;
    // 		const progress = Math.round((size * percentage ));
    // 		const emptyProgress = size - progress;
    // 		const progressText = line.repeat(progress).replace(/.$/, slider);
    // 		const emptyProgressText = line.repeat(emptyProgress);
    // 		const bar = progressText + emptyProgressText;
    // 		const calculated = percentage * 100;
    // 		return bar + " " + Math.floor(calculated);
    // 	}
    // }
}
