import ms from 'ms';
import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';
import Infomessage from '../../Classes/Embed';

export default class MuteCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'mute',
            desc: 'Мутит пользователя на опр.время',
            group: 'moderation',
            lvl: 'Moder',
            clientPermissions: ['MANAGE_ROLES', 'BAN_MEMBERS'],
            // userPermissions: ['MANAGE_ROLES', 'BAN_MEMBERS'],
            example: '@User 6h badwords',
        });
    }
    async execute(message: Message, args: string[]) {
        const botconfs = this.client.provider.getBotsettings('botconfs', 'mutes');
        const prefix = this.client.provider.getGuild(message.guild.id, 'prefix');
        const tomute = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!tomute)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Mute',
                        `Используйте ${prefix}${this.options.name} ${this.options.example}`,
                    ).response(),
                ],
            });

        if (tomute.id === message.author.id)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Mute',
                        'Зачем вы пытаетесь замутить самого себя?',
                    ).response(),
                ],
            });

        if (tomute.user.bot)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Mute', 'Не надо мутить бота, он хороший 😦').response(),
                ],
            });

        if (tomute.id === message.guild.ownerId)
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Mute', 'Нельзя замутить создателя сервера').response(),
                ],
            });

        if (message.guild.me.roles.highest.position < tomute.roles.highest.position)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Mute',
                        'Не могу его замутить, так как его роль находиться выше моей',
                    ).response(),
                ],
            });

        if (tomute.roles.highest.position === message.member.roles.highest.position)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Mute',
                        'Не могу его замутить, так как Вы находитесь в одной роли',
                    ).response(),
                ],
            });

        if (tomute.roles.highest.position > message.member.roles.highest.position)
            return message.channel.send({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Mute',
                        'Не могу его замутить, так как его роль находиться выше Вашей роли',
                    ).response(),
                ],
            });

        const mutetime = args[1];

        if (!mutetime)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Mute', 'Укажите время').response()],
            });

        if (isNaN(ms(mutetime)))
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Mute', 'Введите корректное значение').response()],
            });

        if (!ms(mutetime))
            return message.channel.send({
                embeds: [
                    new Infomessage('RED', 'Mute', 'Введите большее значение времени').response(),
                ],
            });

        const reason = args.slice(2).join(' ');
        if (!reason.length)
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Mute', 'Введите причину').response()],
            });

        if (botconfs[tomute.id])
            return message.channel.send({
                embeds: [new Infomessage('RED', 'Mute', 'Человек уже находится в муте').response()],
            });

        const data = [tomute, mutetime, reason];
        this.client.mute.MuteMember(message, data);
    }
}
