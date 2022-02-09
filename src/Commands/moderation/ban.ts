import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class BanCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ban',
            desc: 'Банит пользователя/лей на сервере по определенной причине',
            group: 'moderation',
            lvl: 'Moder',
            clientPermissions: ['BAN_MEMBERS'],
            // userPermissions: ['BAN_MEMBERS'],
            example: '@User#4444 @User2#4444 Spam',
        });
    }
    async execute(message: Message, args: string[]) {
        const members = message.mentions.members.map((user) => user);
        if (!members.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Ban', 'Упомяните пользователя/лей').response()],
            });
        const reason = args.slice(members.length).join(' ');
        if (!reason.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Ban', 'Введите причину').response()],
            });
        const msg = await message.channel.send({
            embeds: [new Infomessage('YELLOW', 'Ban', 'Начинаю банить пользователей').response()],
        });
        const result = await Promise.all(
            members
                .filter(
                    (x) =>
                        !x.user.bot &&
                        x.id !== message.author.id &&
                        x.id !== message.guild.ownerId &&
                        !this.client.permission.root.includes(x.id),
                )
                .map((x) =>
                    message.guild.members.ban(x, {
                        days: 7,
                        reason: `${message.author.username}#${message.author.discriminator}: ${reason}`,
                    }),
                )
                .map((banReq) => banReq.catch((e) => e)),
        );
        const succeeded = result.filter((x) => !(x instanceof Error)).length;
        const failed = result.filter((x) => x instanceof Error).length;
        const color = 'GREEN';
        const title = 'Ban';
        const desc = `✅ Успешно забанил ${succeeded} пользователей ${
            failed ? `❌ Не смог забанить ${failed} пользователей` : ''
        }`;
        return msg.edit({ embeds: [new Infomessage(color, title, desc).response()] });
    }
}
