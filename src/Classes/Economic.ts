import { Guild, GuildMember } from 'discord.js';
import ExtendedClient from '../Client';
import { IUserStats } from '../Interface';

export default class Economic {
    protected readonly client: ExtendedClient;
    constructor(client: ExtendedClient) {
        this.client = client;
    }

    getUser(member: GuildMember): IUserStats | null {
        const currenetUserSystem = this.client.provider.getGuild(member.guild.id, 'usersystem');
        const userstats = currenetUserSystem.stats;
        if (userstats[member.id]) return userstats[member.id] as IUserStats;
        return null;
    }

    async removeUser(member: GuildMember): Promise<string | boolean> {
        const currentUsersys = this.client.provider.getGuild(member.guild.id, 'usersystem');
        const user = this.getUser(member);
        const userStats = currentUsersys.stats;
        if (!user) return null;
        try {
            console.log(
                `Economic: Удаление аккауна пользователя ${member.user.username} [${member.id}] на сервере [${member.guild.id}|${member.guild.name}]`,
            );
            delete userStats[member.id];
            await this.saveAllProfile(member.guild);
            return true;
        } catch (e) {
            console.log(
                `Economic: Произошла ошибка в функции *removeUser* на сервере [${member.guild.id}|${member.guild.name}]. Ошибка: ${e.message}`,
            );
            return e.message;
        }
    }

    async findOrCreate(member: GuildMember) {
        let user = this.getUser(member);
        if (!user) user = await this.createUser(member);
        return user;
    }

    async createUser(member: GuildMember): Promise<IUserStats> {
        const currentUsersys = this.client.provider.getGuild(member.guild.id, 'usersystem'); // Создание пользователя
        const user = this.getUser(member);
        const userStats: IUserStats = currentUsersys.stats;
        if (user) return null;
        try {
            userStats[member.id] = {
                coins: 0,
                lvl: 1,
                exp: 0,
            };
            console.log(
                `Economic: Создал аккуант пользователю ${member.user.username} [${member.id}] на сервере [${member.guild.id}|${member.guild.name}]`,
            );
            await this.saveAllProfile(member.guild); // Сохранение
            return userStats[member.id];
        } catch (e) {
            console.log(
                `Economic: Произошла ошибка в функции *createUser* на сервере [${member.guild.id}|${member.guild.name}]. Ошибка: ${e.message}`,
            );
            return e.message;
        }
    }

    async saveAllProfile(guild: Guild): Promise<boolean | string> {
        // Сохранение всей информации о пользователях
        const currentUsersys = this.client.provider.getGuild(guild.id, 'usersystem');
        try {
            await this.client.provider.setGuild(guild.id, 'usersystem', currentUsersys);
        } catch (e) {
            console.log(
                `Economic: Произошла ошибка в функции *saveAllProfile* на сервере [${guild.id}|${guild.name}]. Ошибка: ${e.message}`,
            );
            return e.message;
        }
        return true;
    }
}
