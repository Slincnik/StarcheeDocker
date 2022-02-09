import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class DeleteAutoRoleCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'deleteautorole',
            aliases: ['deletear'],
            group: 'administration',
            desc: 'Удаляет автоматические роли',
        });
    }
    async execute(message: Message, args: string[]) {
        const roles = message.mentions.roles.map((role) => role.id);
        if (!roles.length)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'DeleteAutoRole', 'Упомяните роль/роли').response(),
                ],
            });
        const joinroles = this.client.provider.getGuild(message.guild.id, 'joinroles') as string[];
        const result = await Promise.all(
            roles
                .filter((x) => joinroles.includes(x))
                .map((x) => joinroles.splice(joinroles.indexOf(x), 1)),
        );
        await this.client.provider.setGuild(message.guild.id, 'joinroles', joinroles);
        return message.channel.send({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'DeleteAutoRole',
                    `Успешно удалил ${result.length} ролей(и/ль)`,
                ).response(),
            ],
        });
    }
}
