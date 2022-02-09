import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class KickCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'kick',
            desc: 'Выгоняет пользователя/лей с сервера',
            group: 'moderation',
            lvl: 'Moder',
            clientPermissions: ['KICK_MEMBERS'],
            // userPermissions: ['KICK_MEMBERS'],
            example: '@User#4444 @User2#4444 Spam',
        });
    }
    async execute(message: Message, args: string[]) {
        const members = message.mentions.members.map((user) => user);
        if (!members.length) {
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Kick', 'Упомяните пользователя/лей').response()],
            });
        }
        const reason = args.slice(members.length).join(' ');
        if (!reason.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Kick', 'Введите причину').response()],
            });
        const msg = await message.channel.send({
            embeds: [
                new Infomessage('YELLOW', 'Kick', 'Начинаю выгонять пользователей').response(),
            ],
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
                    x.kick(`${message.author.username}#${message.author.discriminator}: ${reason}`),
                )
                .map((p) => p.catch((e) => e)),
        );
        const succeeded = result.filter((x) => !(x instanceof Error)).length;
        const failed = result.filter((x) => x instanceof Error).length;
        const color = 'GREEN';
        const title = 'Ban';
        const desc = `✅ Успешно выгнал ${succeeded} пользователей ${
            failed ? `❌ Не смог выгнать ${failed} пользователей` : ''
        }`;
        return msg.edit({ embeds: [new Infomessage(color, title, desc).response()] });
    }
}
