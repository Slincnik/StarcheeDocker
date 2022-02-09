import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildDeleteEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildDelete');
    }
    async run(guild: Guild) {
        if (!this.client.provider.isReady) return;
        const guildOwner = await guild.fetchOwner();
        const embed = new MessageEmbed()
            .setTimestamp()
            .setAuthor({
                name: `${guild.name} (${guild.id})`,
            })
            .addField('Owner', `${guildOwner.user.tag} (${guild.ownerId})`)
            .setColor('RED')
            .setFooter({ text: 'LEFT DISCORD SERVER' });
        await this.client.provider.clearGuild(guild.id);
        const channel = this.client.channels.cache.get('750208716665520229') as TextChannel;
        channel && channel.send({ embeds: [embed] }).catch((err) => console.error(err));
    }
}
