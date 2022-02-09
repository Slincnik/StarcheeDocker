import IUserStats from "./UserStats";

export default interface GuildKeys {
    prefix: string;
    welcomelog: {
        value: boolean;
        channel: string;
    };
    byelog: {
        value: boolean;
        channel: string;
    };
    banaddlog: {
        value: boolean;
        channel: string;
    };
    banremovelog: {
        value: boolean;
        channel: string;
    };
    welcomeuser: {
        value: boolean;
        channel: string;
        message: string;
    };
    byeuser: {
        value: boolean;
        channel: string;
        message: string;
    };
    music: {
        volume: number;
        blacklist: string[];
    };
    tickets: {
        value: boolean;
        blacklist: string[];
        channels: {};
    };
    usersystem: {
        value: boolean;
        lvlup: {
            value: boolean;
            message: string;
        };
        stats: object
    };
    subscribe: {
        value: boolean;
        date: number;
    };
    blacklist: string[];
    chatfilter: {
        filter: boolean;
        array: string[];
    };
    modules: {
        account: boolean;
        administration: boolean;
        economic: boolean;
        find: boolean;
        games: boolean;
        help: boolean;
        moderation: boolean;
        music: boolean;
        stats: boolean;
        utility: boolean;
    };
    perms: object;
    joinroles: string[];
    warnings: {
        value: boolean;
        list: object;
        count: number;
    };
    personalroles: object;
    mute: {
        automutetime: string;
        muterole: string;
        channelblacklist: string[];
        chatfilter: boolean;
    };
    captcha: {
        value: boolean;
        channel: string;
        roleid: string;
    };
}
