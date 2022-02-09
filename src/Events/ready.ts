import { Event } from '../Classes/Event';
import Permission from '../Classes/Permission';
import Client from '../Client';

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

        await client.provider.init(client);
        //client.guilds.cache.get('447860330958159874').commands.set(client.slashArray);
        // .then((cmd) => {
        //     const getRoles = (commandName) => {
        //         const permissions = client.slashArray.find(x => x.name === commandName).userPermissions;
        //         if (permissions) return null;
        //     }
        // })
        client.permission = new Permission(this.client);

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
