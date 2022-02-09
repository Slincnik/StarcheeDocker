import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class BotGuildsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'bot-guilds',
            aliases: ['bg'],
            group: 'utility',
            desc: 'Вывод топ 10 гильдий по количеству пользователей',
        });
    }
    async execute(message: Message, args: string[]) {
        const guilds = this.client.guilds.cache
            .sort((a, b) => b.memberCount - a.memberCount)
            .first(10);

        const description = guilds
            .map((guild, index) => {
                return `${++index}. *${guild.name}* -> ${guild.memberCount} users`;
            })
            .join('\n');
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('Top Guilds')
                    .setDescription(description)
                    .setFooter({
                        text: 'Prod. starchee',
                        iconURL:
                            'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                    }),
            ],
        });
    }
}
