import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';
import { IMuteConf } from '../Interface';

export default class GuildMemberAddEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildMemberAdd');
    }
    async run(member: GuildMember) {
        if (member.user.bot) return;
        if (!this.client.provider.isReady) return;
        let muteOfThisUser: IMuteConf;
        const muteconf = this.client.provider.getBotsettings('botconfs', 'mutes') as IMuteConf;
        const joinroles = this.client.provider.getGuild(member.guild.id, 'joinroles') as string[];
        const personalRoles = this.client.provider.getGuild(member.guild.id, 'personalroles');
        if (personalRoles[member.id]) {
            const role = member.guild.roles.cache.find(
                (rl) => rl.id === personalRoles[member.id].roleid,
            );
            if (role) member.roles.add(role);
            else {
                const newPersonalRole = await member.guild.roles.create({
                    name: personalRoles[member.id].name,
                    color: personalRoles[member.id].color,
                    reason: `Create personal role for a ${member}'s`,
                });
                personalRoles[member.id].roleid = newPersonalRole.id;
                await this.client.provider.setGuild(
                    member.guild.id,
                    'personalroles',
                    personalRoles,
                );
                member.roles.add(newPersonalRole);
            }
        }
        const rolesNotGiven = [];
        for (const i in muteconf) {
            if (muteconf[i].guild === member.guild.id && i === member.id) {
                muteOfThisUser = muteconf[i];
            }
        }
        if (muteOfThisUser) {
            if (Date.now() < muteOfThisUser.time) {
                const muterole = member.guild.roles.cache.find(
                    (val) =>
                        val.id ===
                        this.client.provider.getGuild(muteOfThisUser.guild, 'mute').muterole,
                );
                if (muterole) {
                    if (!member.roles.cache.get(muterole.id)) {
                        await member.roles.add(muterole).catch((err) => console.error(err));
                    }
                }
            } else {
                delete muteconf[muteOfThisUser.memberid];
                await this.client.provider.setBotsettings('botconfs', 'mutes', muteconf);
            }
        }

        if (joinroles.length) {
            for (const roles of joinroles) {
                const role = member.guild.roles.cache.get(roles);
                if (role)
                    try {
                        await member.roles.add(role);
                    } catch (error) {
                        console.error(
                            `Не смог выдать автоматическую роль ${role} на сервер ${member.guild.name}|${member.guild.id} причина: ${error}`,
                        );
                        rolesNotGiven.push(role);
                    }
            }
            if (rolesNotGiven.length) {
                member
                    .send(`Не смог выдать вам роли ${rolesNotGiven.join(', ')}`)
                    .catch(() => console.log('Не смог отправить пчелу сообщение!'));
            }
        }

        const welcomelog = this.client.provider.getGuild(member.guild.id, 'welcomelog');
        // Logs
        if (welcomelog.value) {
            const messagechannel = this.client.channels.cache.get(
                welcomelog.channel,
            ) as TextChannel;
            const embed = new MessageEmbed()
                .setFooter({
                    text: 'Prod. starchee',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                })
                .setTimestamp()
                .setColor('GREEN')
                .setDescription('User join to the server')
                .setAuthor({
                    name: `${member.user.tag} (${member.user.id})`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                });
            messagechannel.send({ embeds: [embed] }).catch((err) => console.error(err));
        }

        const welcomeuser = this.client.provider.getGuild(member.guild.id, 'welcomeuser');

        if (welcomeuser.value) {
            if (welcomeuser.message.length < 1) return;
            const messagechannel = this.client.channels.cache.get(
                welcomeuser.channel,
            ) as TextChannel;
            const newmssages = welcomeuser.message
                .replace('$username$', member.user.username)
                .replace('$usermention$', member.user)
                .replace('$usertag$', member.user.tag)
                .replace('$userid$', member.user.id)
                .replace('$guildname$', member.guild.name)
                .replace('$guildid$', member.guild.id);
            const welcomembed = new MessageEmbed()
                .setFooter({
                    text: 'Prod. starchee',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
                })
                .setTimestamp()
                .setDescription(newmssages)
                .setColor('GREEN');
            messagechannel.send({ embeds: [welcomembed] }).catch((err) => console.error(err));
        }
    }
}
