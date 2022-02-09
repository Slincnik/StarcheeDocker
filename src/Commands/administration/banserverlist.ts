import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class BanServerListCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'banserverlist',
            aliases: ['bsl'],
            group: 'administration',
            desc: 'Показывает все сервера которым запрещен доступ к боту',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        const blacklist = await this.client.provider.fetchBotSettings('botconfs', 'blacklist');
        if (!Object.keys(blacklist).length) {
            const color = 'RED';
            const title = 'BanServerList';
            const desc = 'Нету забаненных серверов';
            return message.channel.send({
                embeds: [new Infomessage(color, title, desc).response()],
            });
        }

        const banlist = [];

        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle('BanServerList')
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            });
        Object.keys(blacklist).forEach((r) => {
            const guild = this.client.guilds.cache.get(r);
            embed.addField(guild.id, guild.name);
        });
        await message.channel.send({ embeds: [embed] });
    }
}
