import { GuildMember } from "discord.js";
import moment from "moment";
import { Event } from "../Classes/Event";
import Client from "../Client";
import { IMuteConf } from "../Interface";

export default class GuildMemberUpdateEvent extends Event {
    constructor(client: Client) {
        super(client, 'guildMemberUpdate');
    }
    async run(oldMember: GuildMember, newMember: GuildMember) {
        if (!this.client.provider.isReady) return;
        let removedRole: string; // Переменная для ID удаленной роли
        oldMember.roles.cache.every((value) => {
            if (!newMember.roles.cache.find(rl => rl.id === value.id)) {
                removedRole = value.id;
            }
            return true;
        })

        let muteOfThisUser: IMuteConf;
        const muteconf = this.client.provider.getBotsettings('botconfs', 'mutes') as IMuteConf;
        for (const i in muteconf) {
            if (muteconf[i].guild === newMember.guild.id && i === newMember.user.id) {
                muteOfThisUser = muteconf[i];
            }
        }
        if (muteOfThisUser) {
            if (Date.now() < muteOfThisUser.time) {
                const muterole = newMember.guild.roles.cache.find(val => val.id === removedRole); // Происк роли мута
                if (muterole) {
                    await newMember.roles.add(muterole).catch(err => console.error(err));
                    console.log(`${moment().format('LLL')} [${newMember.guild.name}]|${newMember.guild.id} выдал роль мута обратно пользователю ${newMember.user.username}`);
                }
            }
        }
    }
}
