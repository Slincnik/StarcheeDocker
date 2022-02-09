import { MessageEmbed } from 'discord.js';
import moment from 'moment';

import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';

export default class UserinfoCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'userinfo',
            desc: 'Показывает основную информацию о вашем аккаунте',
            group: 'utility',
        });
    }
    async execute(message: Message, args: string[]) {
        moment.locale('ru');
        const statuses = {
            dnd: 'Нет на месте',
            online: 'В сети',
            idle: 'Нет на месте',
            offline: 'Не в сети',
        };
        const userDesc: string = this.client.provider.getUser(message.author.id, 'description');
        const info = new MessageEmbed()
            .setAuthor({
                name: `Вся информация о пользователе ${message.author.username}`,
            })
            .addField('Username', message.author.username)
            .addField('Описание', userDesc.length ? userDesc : 'Отсутствует')
            // .addField('Presence Status:', statuses[message.author.presence.status], true)
            .addField(
                '**Create date**:',
                `${moment.utc(message.author.createdAt).format('LLL')} (${moment(
                    message.author.createdAt,
                ).fromNow()})`,
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.member.displayHexColor)
            .addField(
                `Роли [${
                    message.member.roles.cache.filter((rol) => rol.name !== '@everyone').size !== 0
                        ? message.member.roles.cache.filter((rol) => rol.name !== '@everyone').size
                        : 0
                }]:`,
                message.member.roles.cache
                    .filter((rol) => rol.name !== '@everyone')
                    .sort((a, b) => b.position - a.position)
                    .map((r) => r)
                    .join(' ') || 'Нету',
            )
            .addField('Nickname', message.member.nickname || 'None', true)
            .addField('Color of highest role:', message.member.displayHexColor, true)
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            })
            .setTimestamp();
        return message.channel.send({ embeds: [info] });
    }
}
