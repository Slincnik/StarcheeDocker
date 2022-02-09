import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class AutoRoleCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'autorole',
            desc: 'Добавление ролей при заходе пользователя на сервер',
            group: 'administration',
            clientPermissions: ['MANAGE_ROLES'],
            lvl: 'Moder',
        });
    }
    async execute(message: Message, args: string[]) {
        const roles = message.mentions.roles.map((role) => role.id);
        if (!roles.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Autorole', 'Упомяните роль/роли').response()],
            });
        const joinroles = this.client.provider.getGuild(message.guild.id, 'joinroles');
        const result = await Promise.all(
            roles.filter((x) => !joinroles.includes(x)).map((x) => joinroles.push(x)),
        );
        await this.client.provider.setGuild(message.guild.id, 'joinroles', joinroles);
        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'Autorole',
                    `Успешно добавил ${result.length} ролей(и/ль)`,
                ).response(),
            ],
        });
    }
}
