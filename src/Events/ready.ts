import { Event } from '../Classes/Event';
import Permission from '../Classes/Permission';
import Client from '../Client';
import guildsettingskeys from '../Utils/guildkeys.json';
export default class ReadyEvent extends Event {
    constructor(client: Client) {
        super(client, 'ready');
    }
    async run() {
        const client = this.client;
        console.log(`Logged in as ${client.user.tag}!`);

        client.user.setPresence({
            activities: [{ name: 'с discord.js', url: 'https://discord.com/', type: 'PLAYING' }],
            status: 'online',
        });

        // TODO: Доделать
        // client.guilds.cache.forEach((value) => {
        //     client.scheduled.set(value.id, {
        //         users: {}
        //     });
        // });

        await client.provider.init(client);
        client.permission = new Permission(this.client);

        client.provider.guildsID.forEach(async (value: string) => {
            const tableload = await this.client.provider.fetchGuild(value);
            if (tableload) {
                // tslint:disable-next-line: forin
                for (const key in guildsettingskeys) {
                    if (
                        (!tableload[key] && typeof tableload[key] === 'undefined') ||
                        typeof tableload[key] !==
                            (!Array.isArray(guildsettingskeys[key])
                                ? typeof guildsettingskeys[key]
                                : 'array')
                    ) {
                        tableload[key] = guildsettingskeys[key];
                    }
                    for (const key2 in guildsettingskeys[key]) {
                        if (
                            (!tableload[key][key2] && typeof tableload[key][key2] === 'undefined') ||
                            typeof tableload[key][key2] !==
                                (!Array.isArray(guildsettingskeys[key][key])
                                    ? typeof guildsettingskeys[key][key2]
                                    : 'array')
                        ) {
                            tableload[key] = guildsettingskeys[key];
                        }
                    }
                }
                await this.client.provider.setGuildComplete(value, tableload);
            } else {
                await this.client.provider.reloadGuild(value);
            }
        });

        function timeoutForMute(muteconf: { memberid: string }, newMuteTime: number) {
            setTimeout(async () => {
                await client.mute.UnmuteMember(muteconf.memberid);
            }, newMuteTime);
        }
        function timeoutForDaily(dailyreminder: { userID: string | number }, timeoutTime: number) {
            setTimeout(async () => {
                const currentDailyreminder = client.provider.getBotsettings(
                    'botconfs',
                    'dailyreminder',
                );
                delete currentDailyreminder[dailyreminder.userID];
                await client.provider.setBotsettings(
                    'botconfs',
                    'dailyreminder',
                    currentDailyreminder,
                );
            }, timeoutTime);
        }
        if (typeof client.provider.getBotsettings('botconfs', 'dailyreminder') !== 'undefined') {
            for (const index in client.provider.getBotsettings('botconfs', 'dailyreminder')) {
                if (
                    Object.keys(client.provider.getBotsettings('botconfs', 'dailyreminder'))
                        .length !== 0
                ) {
                    const timeoutTime =
                        client.provider.getBotsettings('botconfs', 'dailyreminder')[index].remind -
                        Date.now();
                    timeoutForDaily(
                        client.provider.getBotsettings('botconfs', 'dailyreminder')[index],
                        timeoutTime,
                    );
                }
            }
        }

        if (typeof client.provider.getBotsettings('botconfs', 'mutes') !== 'undefined') {
            for (const index2 in client.provider.getBotsettings('botconfs', 'mutes')) {
                if (!Object.keys(client.provider.getBotsettings('botconfs', 'mutes')).length) {
                    const newMuteTime =
                        client.provider.getBotsettings('botconfs', 'mutes')[index2].time -
                        Date.now();
                    timeoutForMute(
                        client.provider.getBotsettings('botconfs', 'mutes')[index2],
                        newMuteTime,
                    );
                }
            }
        }
    }
}
