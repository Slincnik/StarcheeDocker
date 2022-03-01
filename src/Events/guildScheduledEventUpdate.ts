import { GuildScheduledEvent, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildScheduledEventUpdateEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildScheduledEventUpdate');
    }
    async run(oldscheduledEvent: GuildScheduledEvent, newscheduledEvent: GuildScheduledEvent) {
        const modlogSettings = this.client.provider.getGuild(newscheduledEvent.guildId, 'modlog');
        if (modlogSettings.value) {
            const modlogID = modlogSettings.channel ? modlogSettings.channel : null;
            const statused = {
                SCHEDULED: 'запланнированое',
                ACTIVE: 'активное',
                COMPLETED: 'завершенно',
                CANCELED: 'отменено',
            };
            const embed = new MessageEmbed()
                .setTitle(`Событие ${statused[newscheduledEvent.status]}`)
                .addField('Название', newscheduledEvent.name)
                .addField(
                    'Время начала',
                    `<t:${Math.floor(newscheduledEvent.scheduledStartTimestamp / 1000)}:f>`,
                )
                .setTimestamp();
            newscheduledEvent.entityType === 'VOICE'
                ? embed.addField(
                      'Канал',
                      `<#${
                          newscheduledEvent.guild.channels.cache.get(newscheduledEvent.channelId)
                              .id
                      }>`,
                  )
                : embed.addField('Место проведения', newscheduledEvent.entityMetadata.location);
            newscheduledEvent.scheduledEndAt
                ? embed.addField(
                      'Время окончания',
                      `<t:${Math.floor(newscheduledEvent.scheduledEndTimestamp / 1000)}:f>`,
                  )
                : null;
            newscheduledEvent.description
                ? embed.addField('Описание', newscheduledEvent.description)
                : null;
            (this.client.channels.cache.get(modlogID) as TextChannel).send({
                embeds: [embed],
            });
        }
    }
}
