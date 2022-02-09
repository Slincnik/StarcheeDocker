import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class BanListCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'banlist',
            group: 'moderation',
            desc: 'Показывает список забанненых людей на сервере, или одного по ID',
            lvl: 'Moder',
        });
    }
    async execute(message: Message, args: string[]) {
        if (args.length) {
            const memberBan = await message.guild.bans.fetch({
                user: args.join(' '),
            });
            if (!memberBan)
                return message.reply({
                    embeds: [
                        new Infomessage(
                            'RED',
                            'Ban List',
                            'Данного пользователя нету в бане',
                        ).response(),
                    ],
                });
            const infoBan = new MessageEmbed()
                .setColor('ORANGE')
                .setFooter({
                    text: 'Prod. starchee',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                })
                .addField('User', memberBan.user.tag)
                .addField('User ID', memberBan.user.id)
                .addField('Reason', memberBan.reason ? memberBan.reason : 'Отсутствует')
                .setTimestamp();
            return message.reply({
                embeds: [infoBan],
            });
        }
        const bans = await message.guild.bans.fetch();
        const infoBans = new MessageEmbed()
            .setColor('ORANGE')
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            })
            .setTimestamp();
        bans.forEach((value) => {
            infoBans.addField(
                'User username',
                `${value.user.tag}\nReason: ${value.reason ? value.reason : 'Отсутствует'}`,
            );
        });
        if (infoBans.length > 1000)
            return message.reply({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Ban List',
                        'Слишком много забаненных пользователей',
                    ).response(),
                ],
            });
        return message.reply({
            embeds: [infoBans],
        });
    }
}
