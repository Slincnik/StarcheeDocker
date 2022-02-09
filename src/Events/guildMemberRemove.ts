import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildMemberRemoveEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildMemberRemove');
    }
    async run(member: GuildMember) {
        if (member.user.bot) return;
        if (!this.client.provider.isReady) return;

        const byelog = this.client.provider.getGuild(member.guild.id, 'byelog');
        // Logs
        if (byelog.value) {
            const messagechannel = this.client.channels.cache.get(byelog.channel) as TextChannel;
            const embed = new MessageEmbed()
                .setFooter({
                    text: 'Prod. starchee',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                })
                .setTimestamp()
                .setColor('RED')
                .setDescription('User leave from server')
                .setAuthor({
                    name: `${member.user.tag} (${member.user.id})`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                });
            messagechannel.send({ embeds: [embed] }).catch((err) => console.error(err));
        }

        const byeuser = this.client.provider.getGuild(member.guild.id, 'byeuser');
        if (byeuser.value) {
            if (byeuser.message.length < 1) return;
            const messagechannel = this.client.channels.cache.get(byeuser.channel) as TextChannel;

            const newMessage = byeuser.message
                .replace('$username$', member.user.username)
                .replace('$usertag$', member.user.tag)
                .replace('$userid$', member.user.id)
                .replace('$guildname$', member.guild.name)
                .replace('$guildid$', member.guild.id);

            const byeEmbed = new MessageEmbed()
                .setFooter({
                    text: 'Prod. starchee',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                })
                .setTimestamp()
                .setDescription(newMessage)
                .setColor('RED');
            messagechannel.send({ embeds: [byeEmbed] }).catch((err) => console.error(err));
        }
    }
}
