import { MessageEmbed, TextChannel } from 'discord.js';
import { Message } from 'discord.js';
import Infomessage from '../../Classes/Embed';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class AnnounceCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'announce',
            desc: 'Отправлять в выбранный канал объявление',
            group: 'utility',
            format: '#channel text <-ping ?>',
            isbuild: true,
        });
    }
    async execute(message: Message, args: string[]) {
        const channel = message.mentions.channels.first() as TextChannel;
        let mention = false;
        if (!args.length)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Announce',
                        '> Usage: #channel text <-ping ?>',
                    ).response(),
                ],
            });

        if (!channel)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Announce', 'Введите канал').response()],
            });
        if (!args[1])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Announce', 'Введите сообщение').response()],
            });
        if (args.some((val) => val.toLowerCase() === '-ping')) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].toLowerCase() === '-ping') args.splice(i, 1);
            }
            mention = true;
        }
        if (mention) channel.send({ content: '@everyone' });
        const embed = new MessageEmbed()
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTitle('Announce')
            .setDescription(args.slice(1).join(' '))
            .setColor('RANDOM')
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            });
        message.attachments && message.attachments.forEach((v) => embed.setImage(v.url));
        channel.send({ embeds: [embed] });
    }
}
