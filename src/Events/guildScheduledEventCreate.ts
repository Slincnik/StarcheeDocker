import { GuildScheduledEvent, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class GuildScheduledEventCreateEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildScheduledEventCreate');
    }
    async run(scheduledEvent: GuildScheduledEvent) {
        if (!this.client.provider.isReady) return;
        const scheduledEventSettings = this.client.provider.getGuild(
            scheduledEvent.guildId,
            'scheduledEvent',
        );
        if (scheduledEventSettings.value) {
            const channelEventID = scheduledEventSettings.channel
                ? scheduledEventSettings.channel
                : null;
            const statused = {
                SCHEDULED: 'Запланнированое',
                ACTIVE: 'Активное',
                COMPLETED: 'Завершенно',
                CANCELED: 'Отменено',
            };
            const embed = new MessageEmbed()
                .setTitle('Новое событие')
                .addField('Статус', statused[scheduledEvent.status])
                .addField('Название', scheduledEvent.name)
                .addField('Время начала', `<t:${Math.floor(scheduledEvent.scheduledStartTimestamp/1000)}:f>`)
                .setTimestamp();
            scheduledEvent.entityType === 'VOICE'
                ? embed.addField(
                      'Канал',
                      `${scheduledEvent.guild.channels.cache.get(scheduledEvent.channelId).name}`,
                  )
                : embed.addField('Место проведения', scheduledEvent.entityMetadata.location);
            scheduledEvent.scheduledEndAt
                ? embed.addField(
                      'Время окончания',
                      `<t:${Math.floor(scheduledEvent.scheduledEndTimestamp/1000)}:f>`,
                  )
                : null;
            scheduledEvent.description
                ? embed.addField('Описание', scheduledEvent.description)
                : null;
            (this.client.channels.cache.get(channelEventID) as TextChannel).send({
                embeds: [embed],
                content: '@everyone',
            });
        }
    }
}
