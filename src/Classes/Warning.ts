import { ClientUser, Guild, GuildMember, Message, User } from "discord.js";
import ExtendedClient from "../Client";

export default class Warning {
    protected readonly client: ExtendedClient;
    constructor(client: ExtendedClient) {
        this.client = client;
    }

    async AddWarning(message: Message, args: (GuildMember | string | ClientUser | User)[]) {
        try {
            const member = args[0] as GuildMember;
            const reason = args[1] as string;
            const mod = args[2] as GuildMember | ClientUser;
            const warnings = this.client.provider.getGuild(message.guild.id, 'warnings');
            const settings = {
                reason: []
            };
            const infobans = warnings.list;
            if (!infobans[member.id]) {
                infobans[member.id] = settings;
                infobans[member.id].reason.push({
                    reason,
                    mod: mod.id
                });
            } else {
                infobans[member.id].reason.push({
                    reason,
                    mod: mod.id
                });
            }
            await this.client.provider.setGuild(message.guild.id, 'warnings', warnings);
        } catch (error) {
            console.error(error);
            throw error
        }
    }

    async CheckMuteWarningsCount(guild: Guild, member: GuildMember) {
        try {
            const warnings = this.client.provider.getGuild(guild.id, 'warnings');
            if (warnings.list[member.id].reason.length >= warnings.count) {
                delete warnings.list[member.id];
                await this.client.provider.setGuild(guild.id, 'warnings', warnings);
                guild.members.ban(member);
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }
}