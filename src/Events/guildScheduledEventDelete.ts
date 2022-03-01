import { GuildScheduledEvent, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildScheduledEventDeleteEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildScheduledEventDelete');
    }
    async run(scheduledEvent: GuildScheduledEvent) {
        if (!this.client.provider.isReady) return;
        const modlogSettings = this.client.provider.getGuild(scheduledEvent.guildId, 'modlog');
        if (modlogSettings.value) {
            const modlogchannelID = modlogSettings.channel ? modlogSettings.channel : null;
            const embed = new MessageEmbed()
                .setTitle('Cобытие удалено')
                .addField('Название', scheduledEvent.name);
            (this.client.channels.cache.get(modlogchannelID) as TextChannel).send({
                embeds: [embed],
            });
        }
    }
}
