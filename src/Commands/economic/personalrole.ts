import { ColorResolvable, Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class RoleCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'personalrole',
            checksystem: 'economic',
            group: 'economic',
            desc: 'Покупка личной роли',
        });
    }
    async execute(message: Message, args: string[]) {
        const price = 1000;
        const personalRoles = this.client.provider.getGuild(message.guild.id, 'personalroles');
        if (!args.length)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Role', '> Usage: role <#HexColor> <Name>').response(),
                ],
            });
        if (personalRoles[message.member.id])
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Role', 'У вас уже есть персональная роль').response(),
                ],
            });
        const hexColor = args[0];
        if (!hexColor.startsWith('#'))
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Role', 'Введите hex цвет').response()],
            });
        const splitedColor = hexColor.split('#');
        if (!splitedColor[1])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Role', 'Введите корректное значение').response()],
            });
        if (!args[1])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Role', 'Введите название роли').response()],
            });
        const memberData = this.client.economic.getUser(message.member);
        if (!memberData)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Role', 'У вас нету экономического профиля').response(),
                ],
            });
        if (memberData.coins < price)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Role', 'У вас недостаточно средств').response()],
            });
        try {
            const role = await message.guild.roles.create({
                name: args.splice(1).join(' '),
                color: hexColor as ColorResolvable,
                mentionable: true,
                reason: 'Create personal role',
            });
            message.member.roles.add(role);
            personalRoles[message.member.id] = {
                roleid: role.id,
                color: hexColor,
                name: role.name,
            };
            memberData.coins -= price;
            await this.client.economic.saveAllProfile(message.guild);
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'GREEN',
                        'Role',
                        `Создал вашу персональную роль. Её название: \`${role.name}\` \n\`С вас сняли ${price} за роль\``,
                    ).response(),
                ],
            });
        } catch (error) {
            console.error(error);
            message.channel.send('Случилась ошибка');
            throw error;
        }
    }
}
