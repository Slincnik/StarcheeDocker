import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class UnbanCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'unban',
            desc: 'Удаляет пользователя/лей из бана',
            group: 'moderation',
            lvl: 'Moder',
            clientPermissions: ['BAN_MEMBERS'],
            // userPermissions: ['BAN_MEMBERS'],
            example: '123456531434582016',
        });
    }
    async execute(message: Message, args: string[]) {
        const members = args.map((user) => user).filter((v) => /[^a-zа-я]/i.test(v));
        if (!members.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Unban', 'Введите ID пользователя/лей').response()],
            });
        const reason = args.slice(members.length).join(' ');
        if (!reason.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Ban', 'Введите причину').response()],
            });
        const msg = await message.channel.send({
            embeds: [new Infomessage('YELLOW', 'Unban', 'Начинаю разбан пользователей').response()],
        });
        message.guild.bans.fetch().then(async (bans) => {
            const result = await Promise.all(
                members
                    .filter((x) => bans.filter((r) => r.user.id === x).first())
                    .map((x) => message.guild.members.unban(x, reason))
                    .map((unBanReq) => unBanReq.catch((e) => e)),
            );
            const succeeded = result.filter((x) => !(x instanceof Error)).length;
            const failed = result.filter((x) => x instanceof Error).length;
            const color = 'GREEN';
            const title = 'Unban';
            const desc = `✅ Успешно разбанил ${succeeded} пользователей ${
                failed ? `❌ Не смог разбанить ${failed} пользователей` : ''
            }`;
            return msg.edit({ embeds: [new Infomessage(color, title, desc).response()] });
        });
    }
}
