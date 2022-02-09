import {
    ClientUser,
    GuildMember,
    Message,
    MessageEmbed,
    Role,
    TextChannel,
    User,
} from 'discord.js';
import ms from 'ms';
import infomessage from './Embed';
import ExtendedClient from '../Client';
import Warning from './Warning';
import Infomessage from './Embed';

export default class Mute {
    protected readonly client: ExtendedClient;
    protected readonly WarningsSystem: Warning;
    constructor(client: ExtendedClient) {
        this.WarningsSystem = new Warning(client);
        this.client = client;
    }
    async MuteMember(
        message: Message,
        args: (string | number | GuildMember)[],
        auto: boolean = false,
    ) {
        const botconfs = this.client.provider.getBotsettings('botconfs', 'mutes');
        const mute = this.client.provider.getGuild(message.guild.id, 'mute');
        const tomute = args[0] as GuildMember;
        const mutetime = args[1] as string;
        const reason = args[2] as string;

        let muterole: Role | string = message.guild.roles.cache.get(mute.muterole);
        if (!muterole) muterole = await this.CreateMuteRole(message, mute);

        if (typeof muterole === 'string') {
            const color = 'RED';
            const title = 'Mute';
            const text = muterole;
            return message.channel.send({
                embeds: [new infomessage(color, title, text).response()],
            });
        }

        const myRole = message.guild.me.roles.highest; // Позиция роли бота

        if (muterole.position > myRole.position) {
            const color = 'RED';
            const title = 'Mute';
            const text = `Роль \`${muterole}\` выше моей роли на сервере, измените порядок`;
            return message.channel.send({
                embeds: [new infomessage(color, title, text).response()],
            });
        }

        let mod: ClientUser | User;
        if (!auto) mod = message.author;
        else mod = this.client.user;
        try {
            tomute.roles
                .add(muterole)
                .then(() => {
                    const embed = new MessageEmbed()
                        .setColor(13632027)
                        .setFooter({
                            text: 'Prod. starchee',
                            iconURL:
                                'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                        })
                        .addField('User', `<@${tomute.id}>`, true)
                        .addField('Moderator', `<@${mod.id}>`, true)
                        .addField('Reason', `${reason}`, true)
                        .addField('Duration', `${mutetime}`, true);
                    message.channel.send({ embeds: [embed] });
                })
                .catch((err) =>
                    console.log(
                        `[Mute] [${message.guild.name}](${message.guild.id}) Не смог убрать muterole у [${tomute.user.username}](${tomute.id}) \nПричина: ${err.message}`,
                    ),
                );
            const mutesettings = {
                guild: message.guild.id,
                roleid: muterole.id,
                memberid: tomute.id,
                channelid: message.channel.id,
                mutetime,
                time: Date.now() + ms(mutetime),
            };

            botconfs[tomute.id] = mutesettings;
            await this.client.provider.setBotsettings('botconfs', 'mutes', botconfs);

            setTimeout(async () => {
                this.UnmuteMember(tomute.id);
            }, ms(mutetime));

            // Предупреждения
            const warnings = this.client.provider.getGuild(message.guild.id, 'warnings');
            if (warnings.value) this.WarningsSystem.AddWarning(message, [tomute, reason, mod]);
        } catch (error) {
            console.error(error);
            throw new Error(`Произошла ошибка. Повторите позже. Ошибка: ${error.message}`);
        }
    }

    async UnmuteMember(userId: string) {
        const muteconf = this.client.provider.getBotsettings('botconfs', 'mutes');

        if (!muteconf[userId]) return; // Если такого нет, то как он попал????

        const guild =
            this.client.guilds.cache.get(muteconf[userId].guild) ||
            (await this.client.guilds.fetch(muteconf[userId].guild)); // Получение сервера
        if (!guild) {
            delete muteconf[userId];
            await this.client.provider.setBotsettings('botconfs', 'mutes', muteconf);
            return undefined;
        }

        const member = guild.members.cache.get(muteconf[userId].memberid); // Получение пользователя
        if (!member) {
            delete muteconf[userId];
            await this.client.provider.setBotsettings('botconfs', 'mutes', muteconf);
            return undefined;
        }

        const mutedRole = guild.roles.cache.get(muteconf[userId].roleid); // Получение роли
        if (!mutedRole) {
            delete muteconf[userId];
            await this.client.provider.setBotsettings('botconfs', 'mutes', muteconf);
            return undefined;
        }

        const warnings = this.client.provider.getGuild(muteconf[userId].guild, 'warnings'); // Система предупреждения

        try {
            member.roles
                .remove(mutedRole)
                .then(async () => {
                    const color = 'RED';
                    const title = 'Unmute';
                    const text = `Пользователь ${member} убран из мута!
                    \n${
                        warnings.value
                            ? `У пользователя ${
                                  warnings.list[userId] ? warnings.list[userId].reason.length : 0
                              } предупреждений(я)! Бан даётся при ${
                                  warnings.count
                              } предупреждениях!`
                            : ''
                    }`;
                    const channel = guild.channels.cache.find(
                        (c) => c.id === muteconf[userId].channelid,
                    ) as TextChannel;
                    channel.send({ embeds: [new infomessage(color, title, text).response()] });

                    delete muteconf[userId];
                    await this.client.provider.setBotsettings('botconfs', 'mutes', muteconf);
                    let isBanned = false;
                    // Предупреждения
                    if (warnings.value)
                        isBanned = await this.WarningsSystem.CheckMuteWarningsCount(guild, member);
                    if (isBanned) {
                        const channel = guild.channels.cache.get(
                            muteconf[userId].channelid,
                        ) as TextChannel;
                        if (channel)
                            channel.send({
                                embeds: [
                                    new Infomessage(
                                        'RED',
                                        'Unmute',
                                        `Пользователь ${member} был забанен за преодоление кол-ва предупреждений!
                        \nЕго ID: \`${member.id}\``,
                                    ).response(),
                                ],
                            });
                    }
                })
                .catch((err) =>
                    console.log(
                        `[Unmute] [${guild.name}](${guild.id}) Не смог убрать muterole у [${member.user.username}](${member.id}) \nПричина: ${err.message}`,
                    ),
                );
        } catch (err) {
            console.error(err);
            throw new Error(`Произошла ошибка. Ошибка: ${err.message}`);
        }
    }

    /**
     * Returns the muted list users
     * @param {Message} message - The message of server
     */
    muted(message: Message) {
        let response = '';
        const muteconfs = this.client.provider.getBotsettings('botconfs', 'mutes');
        for (const key in muteconfs) {
            if (muteconfs[key].guild !== message.guild.id) continue;
            response += `\nПользователю <@${key}> осталось ${ms(muteconfs[key].time - Date.now())}`;
        }
        return response;
    }

    async CreateMuteRole(message: Message, mute: any): Promise<string | Role> {
        let muterole: Role;
        try {
            muterole = await message.guild.roles.create({
                name: 'New Muted',
                color: 'RED',
                position: message.guild.me.roles.highest.position - 1,
                hoist: true,
                mentionable: true,
                reason: 'Create muted role',
            });
            try {
                message.guild.channels.cache.forEach(async (channel) => {
                    if (channel.type === 'GUILD_CATEGORY') {
                        await channel.permissionOverwrites.edit(muterole, {
                            SEND_MESSAGES: false,
                            SPEAK: false,
                        });
                    }
                });
            } catch (err) {
                console.error(err);
                return `Произошла ошибка при установление прав роли. Ошибка: ${err.message}`;
            }
            mute.muterole = muterole.id;
            await this.client.provider.setGuild(message.guild.id, 'mute', mute);
        } catch (e) {
            console.error(e);
            return `Произошла ошибка при создании роли. Ошибка: ${e.message}`;
        }
        return muterole;
    }
}
