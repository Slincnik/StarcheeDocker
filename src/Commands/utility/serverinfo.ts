import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class ServerinfoCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'serverinfo',
            desc: 'Выводит основную информацию о сервере',
            aliases: ['si'],
            group: 'utility',
        });
    }
    async execute(message: Message, args: string[]) {
        moment.locale('ru');
        const guild = message.guild;
        const owner = await guild.fetchOwner();
        const embed = new MessageEmbed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .setColor('RANDOM')
            .addField(
                'General Info',
                [`ID: ${guild.id}`, `\nName: ${guild.name}`, `\nOnwer: ${owner}`].toString(),
            )
            .addField('Verification level', message.guild.verificationLevel)
            .addField(
                'Counts',
                [
                    `Roles: ${guild.roles.cache.size}`,
                    `\nChannels: ${
                        guild.channels.cache.filter(
                            (ch) => ch.type === 'GUILD_TEXT' || ch.type === 'GUILD_VOICE',
                        ).size
                    } total (Text: ${
                        guild.channels.cache.filter((ch) => ch.type === 'GUILD_TEXT').size
                    }, Voice: ${
                        guild.channels.cache.filter((ch) => ch.type === 'GUILD_VOICE').size
                    })`,
                    `\nEmojis: ${guild.emojis.cache.size}`,
                ].toString(),
            )
            .addField(
                'Addition Info',
                [
                    `Created at: ${moment.utc(guild.createdTimestamp).format('LLL')} (${moment(
                        guild.createdTimestamp,
                    ).fromNow()})`,
                    `\nJoin at: ${moment.utc(message.member.joinedAt).format('LLL')} (${moment(
                        message.member.joinedAt,
                    ).fromNow()})`,
                    `\nBoosted Tier: ${guild.premiumTier ? `${guild.premiumTier}` : 'None'}`,
                    `\nBoosted Count: ${guild.premiumSubscriptionCount || '0'}`,
                ].toString(),
            )
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            });
        return message.channel.send({ embeds: [embed] });
    }
}
