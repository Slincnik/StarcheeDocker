import { Message } from 'discord.js';
import ms from 'ms';
import Infomessage from '../Classes/Embed';
import { Event } from '../Classes/Event';
import Client from '../Client';
import guildsettingskeys from '../Utils/guildkeys.json';
import usersettingskeys from '../Utils/userkeys.json';

export default class MessageEvent extends Event {
    constructor(client: Client) {
        super(client, 'messageCreate');
    }
    async run(message: Message) {
        if (!this.client.provider.isReady) return;
        if (!this.client.application?.owner) await this.client.application?.fetch();
        if (message.channel.type !== 'GUILD_TEXT') return;
        if (message.author.bot || !message.guild) return;
        const serverbl = await this.client.provider.fetchBotSettings('botconfs', 'blacklist'); // Получение черного списка серверов
        if (serverbl[message.guild.id]) {
            try {
                (await message.guild.fetchOwner())
                    .send('Этот сервер находится в черном списке')
                    .catch((err) =>
                        console.log(
                            `[Blacklist server] (${message.guild.id})|[${message.guild.name}] Не смог отправить создателю сервера сообщение`,
                        ),
                    );
            } catch (e) {
                await message.channel
                    .send('Этот сервер находится в черном списке')
                    .catch((err) =>
                        console.log(
                            `[Blacklist server] (${message.guild.id})|[${message.guild.name}] Не смог отправить сообщение на сервер`,
                        ),
                    );
            }
            return message.guild.leave().catch(console.error);
        }
        const tableload = await this.client.provider.fetchGuild(message.guild.id);
        if (tableload) {
            // Everything can be requested here
            const settings = this.client.provider.guildSettings.get(message.guild.id);
            // tslint:disable-next-line: forin
            for (const key in guildsettingskeys) {
                if (
                    (!settings[key] && typeof settings[key] === 'undefined') ||
                    typeof settings[key] !==
                        (!Array.isArray(guildsettingskeys[key])
                            ? typeof guildsettingskeys[key]
                            : 'array')
                ) {
                    settings[key] = guildsettingskeys[key];
                }
                for (const key2 in guildsettingskeys[key]) {
                    if (
                        (!settings[key][key2] && typeof settings[key][key2] === 'undefined') ||
                        typeof settings[key][key2] !==
                            (!Array.isArray(guildsettingskeys[key][key])
                                ? typeof guildsettingskeys[key][key2]
                                : 'array')
                    ) {
                        settings[key] = guildsettingskeys[key];
                    }
                }
            }
            await this.client.provider.setGuildComplete(message.guild.id, settings);
        } else {
            await this.client.provider.reloadGuild(message.guild.id);
        }
        const userload = await this.client.provider.fetchUser(message.author.id);
        if (userload) {
            let settings = this.client.provider.userSettings.get(message.author.id);
            if (!settings) settings = await this.client.provider.cacheUser(message.author.id, true);
            // tslint:disable-next-line: forin
            for (const key in usersettingskeys) {
                if (!settings[key] && typeof settings[key] === 'undefined') {
                    settings[key] = usersettingskeys[key];
                }
                if (typeof usersettingskeys[key] === 'object') {
                    for (const key2 in usersettingskeys[key]) {
                        if (!settings[key][key2]) {
                            settings[key][key2] = usersettingskeys[key][key2];
                        }
                    }
                }
            }
            await this.client.provider.setUserComplete(message.author.id, settings);
        } else {
            await this.client.provider.reloadUser(message.author.id);
        }
        const prefix = this.client.provider.getGuild(message.guild.id, 'prefix');
        const blacklist: string[] = this.client.provider.getGuild(message.guild.id, 'blacklist');
        // Проверка пользователя на вхождение в черный список
        if (blacklist.includes(message.author.id)) return;
        if (
            message.content.toLowerCase() === '!deploy' &&
            message.author.id === this.client.application?.owner.id
        ) {
            await message.guild.commands.set([
                {
                    name: 'play',
                    description: 'Plays a song',
                    options: [
                        {
                            name: 'song',
                            type: 'STRING' as const,
                            description: 'The URL of the song to play',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'skip',
                    description: 'Skip to the next song in the queue',
                },
                {
                    name: 'queue',
                    description: 'See the music queue',
                },
                {
                    name: 'pause',
                    description: 'Pauses the song that is currently playing',
                },
                {
                    name: 'resume',
                    description: 'Resume playback of the current song',
                },
                {
                    name: 'leave',
                    description: 'Leave the voice channel',
                },
            ]);

            await message.reply('Deployed!');
        }
        if (message.content.startsWith(prefix) && message.channel.type === 'GUILD_TEXT') {
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const commandName = args.shift().toLowerCase();
            const command =
                this.client.commands.get(commandName) ||
                this.client.commands.find(
                    (cmd) => cmd.options.aliases && cmd.options.aliases.includes(commandName),
                );
            if (!command) return;

            if (!this.client.permission.check(message.author.id, message.guild.id, command))
                return command.onBlock(message, 'permission');

            if (command.options.isbuild && !this.client.permission.root.includes(message.author.id))
                return command.onBlock(message, 'build');

            if (command.options.nsfw && !message.channel.nsfw)
                return command.onBlock(message, 'nsfw');

            if (command.options.checksystem) {
                const response = command.checkSystem(message, command.options.checksystem);
                if (typeof response === 'string') return message.reply(response);
            }

            const can = command.can(message);
            if (typeof can === 'string') return message.channel.send(can);

            if (!can) return command.onBlock(message, 'permission');

            const hasPermission = command.hasPermission(message);

            if (typeof hasPermission === 'string') return message.channel.send(hasPermission);

            if (!hasPermission) return command.onBlock(message, 'clientPermission');

            const cooldown = command.cooldown(message.author.id);

            if (cooldown && cooldown.usages > 1) {
                const remaining =
                    (cooldown.start + command.options.cooldown * 1000 - Date.now()) / 1000;
                const data = {
                    cooldown,
                    remaining,
                };
                return command.onBlock(message, 'cooldown', data);
            }

            if (cooldown) cooldown.usages++;

            return new Promise((resolve) => {
                const cmd = command.execute(message, args);
                resolve(cmd);
            }).catch((err) => {
                console.log(err);
                return message.reply('Произошла ошибка');
            });
        } else if (message.channel.type === 'GUILD_TEXT' && !message.content.startsWith(prefix)) {
            const chatfilter = this.client.provider.getGuild(message.guild.id, 'chatfilter');
            const usersystem = this.client.provider.getGuild(message.guild.id, 'usersystem');
            if (usersystem.value) {
                let currentUser = this.client.economic.getUser(message.member);
                if (!currentUser)
                    currentUser = await this.client.economic.createUser(message.member);
                currentUser.coins += randomInteger(1, 5);
                currentUser.exp += randomInteger(1, 5);
                const newLevel = checkExperience(currentUser.exp, currentUser.lvl);
                if (newLevel > currentUser.lvl) {
                    currentUser.lvl = newLevel;

                    if (usersystem.lvlup.value) {
                        if (usersystem.lvlup.message.length > 0) {
                            const msg = usersystem.lvlup.message
                                .replace('$lvl$', newLevel)
                                .replace('$username$', message.author.username)
                                .replace('$usermention$', message.author)
                                .replace('$usertag$', message.author.tag)
                                .replace('$userid$', message.author.id);
                            message.channel
                                .send({
                                    embeds: [new Infomessage('#00f910', 'LvL', msg).response()],
                                })
                                .then((message) => {
                                    setTimeout(() => {
                                        message.delete();
                                    }, 5000);
                                });
                        }
                    }
                }

                await this.client.economic.saveAllProfile(message.guild);
                function randomInteger(min: number, max: number) {
                    const rand = min + Math.random() * (max + 1 - min);
                    return Math.floor(rand);
                }
                function checkExperience(exp: number, level: number) {
                    const y = ((Math.pow(level, 2) + level) / 2) * 100 - Math.pow(Math.E, 2);
                    return exp >= Math.floor(y) ? ++level : level;
                }
            }
            if (chatfilter.filter && chatfilter.array.length) {
                const mute = this.client.provider.getGuild(message.guild.id, 'mute');
                if (mute.channelblacklist.includes(message.channel.id)) return;
                const words = chatfilter.array;
                const filtered = message.content
                    .toLowerCase()
                    .split(' ')
                    .filter((m) => words.includes(m));
                if (filtered.length) {
                    await message.delete();
                    if (mute.chatfilter) {
                        const tomute = message.guild.members.cache.get(message.author.id);
                        const data = [tomute, ms(ms(mute.automutetime)), 'Нецензурные выражения'];
                        this.client.mute.MuteMember(message, data, true);
                    }
                }
            }
        }
    }
}
