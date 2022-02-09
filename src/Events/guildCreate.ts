import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildCreateEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildCreate');
    }
    async run(guild: Guild) {
        if (!this.client.provider.isReady) return;
        const guildOwner = await guild.fetchOwner();
        const blacklist = this.client.provider.getBotsettings('botconfs', 'blacklist');
        if (blacklist[guild.id]) {
            await guildOwner
                .send('Этот сервер находится в черном списке')
                .catch((err) => console.error(err));
            return guild.leave().catch(console.error);
        }
        await this.client.provider.reloadGuild(guild.id);
        const embed1 = new MessageEmbed()
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            })
            .setColor('#ccff33')
            .setDescription(`**Привет ${guildOwner.user.username}**`)
            .setAuthor({
                name: `Спасибо что используете ${this.client.user.username}!`,
                iconURL: this.client.user.displayAvatarURL(),
            })
            .addField(
                'Info',
                `Префикс у бота \`${this.client.provider.getGuild(
                    guild.id,
                    'prefix',
                )}\`. Все команды можно узнать про помощи команды \`help\``,
            );
        guildOwner.send({ embeds: [embed1] }).catch((err) => console.error(err));
        const perms = this.client.provider.getGuild(guild.id, 'perms');
        const settings = {
            role: 'Admin',
        };
        perms[guild.ownerId] = settings;
        await this.client.provider.setGuild(guild.id, 'perms', perms);
        const embed = new MessageEmbed()
            .setTimestamp()
            .setAuthor({
                name: `${guild.name} (${guild.id})`,
            })
            .addField('Owner', `${guildOwner.user.tag} (${guild.ownerId})`)
            .addField('Channels', `${guild.channels.cache.size}`)
            .addField('Members', `${guild.memberCount}`)
            .setColor('GREEN')
            .setFooter({
                text: 'JOINED DISCORD SERVER',
            });
        const channel = this.client.channels.cache.get('750208716665520229') as TextChannel;
        channel && channel.send({ embeds: [embed] }).catch((err) => console.error(err));
    }
}
