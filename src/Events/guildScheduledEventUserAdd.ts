import { GuildScheduledEvent, MessageEmbed, TextChannel, User } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildScheduledEventUserAddEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildScheduledEventUserAdd');
    }
    async run(scheduledEvent: GuildScheduledEvent, user: User) {
        if (!this.client.provider.isReady) return;
        const modlogSettings = this.client.provider.getGuild(scheduledEvent.guildId, 'modlog');
        if (modlogSettings.value) {
            const modlogchannelID = modlogSettings.channel ? modlogSettings.channel : null;

            if (scheduledEvent.creatorId === user.id) return;
            const embed = new MessageEmbed()
                .setTitle('Пользователя интересует событие')
                .addField('Пользователь', `<@${user.id}>`)
                .addField('Название события', scheduledEvent.name)
                .setTimestamp();
            (this.client.channels.cache.get(modlogchannelID) as TextChannel).send({
                embeds: [embed],
            });
        }
    }
}
