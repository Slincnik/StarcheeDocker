import { Collection, Db, Document, MongoClient } from 'mongodb';
import SettingsProvider from './SettingsProvider';
import guildsettingskeys from './guildkeys.json';
import usersettingskeys from './userkeys.json';
import botsettingskeys from './botskeys.json';
import ExtendedClient from '../Client';
import { Config, GuildKeys, UserKeys } from '../Interface';
import { User } from 'discord.js';
export default class Provider extends SettingsProvider {
    protected client: ExtendedClient;
    protected url: string;
    public guildSettings: Map<string, GuildKeys | object> = new Map();
    public userSettings: Map<string, UserKeys | object> = new Map();
    public botSettings: Map<string, any> = new Map();
    private guildSettingsCollection: Collection<Document>;
    private userSettingsCollection: Collection<Document>;
    public isReady: boolean;
    protected dbClient: MongoClient;
    protected db: Db;
    constructor() {
        super();
        this.isReady = false;
    }
    async init(client: ExtendedClient) {
        this.client = client;
        this.dbClient = client.database.dbClient;
        this.db = this.dbClient.db(client.database.selectDB);
        const guildSettingsCollection = this.db.collection('guildSettings');
        this.guildSettingsCollection = guildSettingsCollection;
        const { guildSettings } = this;
        const userSettingsCollection = this.db.collection('userSettings');
        this.userSettingsCollection = userSettingsCollection;
        const { userSettings } = this;
        const botSettingsCollection = this.db.collection('botSettings');
        const { botSettings } = this;

        await guildSettingsCollection.createIndex('guildId', {
            unique: true,
        });
        await userSettingsCollection.createIndex('userId', {
            unique: true,
        });
        await botSettingsCollection.createIndex('botconfs', {
            unique: true,
        });

        /* eslint guard-for-in: 0 */
        // tslint:disable-next-line: forin
        for (const guild in [...client.guilds.cache.values()]) {
            try {
                await this.cacheGuild(guild);
            } catch (err) {
                console.warn(
                    `Error while creating document of guild ${
                        [...client.guilds.cache.values()][guild].id
                    }`,
                );
                console.warn(err);
            }
        }

        try {
            const result = await guildSettingsCollection.findOne({
                guildId: 'global',
            });
            let settings: GuildKeys;

            if (!result) {
                // Could not load global, do new one
                settings = guildsettingskeys;
                guildSettingsCollection.insertOne({
                    guildId: 'global',
                    settings,
                });
                this.setupGuild('global');
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            guildSettings.set('global', settings);
        } catch (err) {
            console.warn('Error while creating guild global document');
            console.warn(err);
        }

        // tslint:disable-next-line: forin
        for (const user in [...client.users.cache.values()]) {
            try {
                await this.cacheUser(user);
            } catch (err) {
                console.warn(
                    `Error while creating document of user ${
                        [...client.users.cache.values()][user].id
                    }`,
                );
                console.warn(err);
            }
        }

        try {
            const result = await userSettingsCollection.findOne({
                userId: 'global',
            });
            let settings;

            if (!result) {
                // Could not load global, do new one
                settings = {};
                userSettingsCollection.insertOne({
                    userId: 'global',
                    settings,
                });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            userSettings.set('global', settings);
        } catch (err) {
            console.warn('Error while creating user global document');
            console.warn(err);
        }

        try {
            const result = await botSettingsCollection.findOne({
                botconfs: 'botconfs',
            });
            let settings;

            if (!result) {
                // Can't find DB make new one.
                settings = botsettingskeys;
                botSettingsCollection.insertOne({
                    botconfs: 'botconfs',
                    settings,
                });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            botSettings.set('botconfs', settings);
        } catch (err) {
            console.warn('Error while creating document of botconfs');
            console.warn(err);
        }

        try {
            const result = await botSettingsCollection.findOne({
                botconfs: 'global',
            });
            let settings;

            if (!result) {
                // Could not load global, do new one
                settings = {};
                botSettingsCollection.insertOne({
                    botconfs: 'global',
                    settings,
                });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            botSettings.set('global', settings);
        } catch (err) {
            console.warn('Error while creating botconfsglobal document');
            console.warn(err);
        }

        this.isReady = true;
    }
    /**
     * Cache user to local userSettings
     * @param user - User ID to be cached
     */
    async cacheUser(user: string, notFor = false) {
        const USER = notFor
            ? this.client.users.cache.get(user)
            : ([...this.client.users.cache.values()][user] as User);
        const result = await this.userSettingsCollection.findOne({
            userId: USER.id,
        });
        let settings: UserKeys;

        if (!result) {
            // Can't find DB make new one.
            settings = usersettingskeys;
            this.userSettingsCollection.insertOne({
                userId: USER.id,
                settings,
            });
        }

        if (result && result.settings) {
            settings = result.settings;
        }
        this.userSettings.set(USER.id, settings);
        return this.userSettings.get(USER.id);
    }
    async cacheGuild(guild: string) {
        const GUILD = [...this.client.guilds.cache.values()][guild];
        const result = await this.guildSettingsCollection.findOne({
            guildId: GUILD.id,
        });
        let settings: GuildKeys;

        if (!result) {
            // Can't find DB make new one.
            settings = guildsettingskeys as GuildKeys;
            this.guildSettingsCollection.insertOne({
                guildId: GUILD.id,
                settings,
            });
        }

        if (result && result.settings) {
            settings = result.settings;
        }

        this.guildSettings.set(this.client.guilds.cache.get(GUILD.id).id, settings);
    }
    async fetchBotSettings(index: string, key: string, key2?: string) {
        const result = await this.db.collection('botSettings').findOne({
            botconfs: index,
        });

        let settings;

        if (result && result.settings) {
            settings = result.settings;
        }

        if (key && !key2) {
            return settings[key];
        }

        if (key2) {
            return settings[key][key2];
        }
        return settings;
    }
    async setGuild(guild: string, key: string, val) {
        guild = super.getGuildID(guild);
        let settings = this.guildSettings.get(guild);
        if (!settings) {
            settings = {};
            this.guildSettings.set(guild, settings);
        }

        settings[key] = val;
        const settingsCollection = this.db.collection('guildSettings');

        await settingsCollection.updateOne(
            {
                guildId: guild,
            },
            {
                $set: {
                    settings,
                },
            },
        );
        return val;
    }

    getUser(user: string, key: string, defVal?: string) {
        const settings = this.userSettings.get(user);
        if (!key && !defVal) {
            return settings;
        }
        return settings ? (typeof settings[key] === 'undefined' ? defVal : settings[key]) : defVal;
    }
    async setUserComplete(user: string, val) {
        let settings = this.userSettings.get(user);
        if (!settings) {
            settings = {};
            this.userSettings.set(user, settings);
        }

        const settingsCollection = this.db.collection('userSettings');

        await settingsCollection.updateOne(
            {
                userId: user,
            },
            {
                $set: {
                    settings: val,
                },
            },
        );
        return val;
    }

    async setBotconfsComplete(botconfs, val) {
        let settings = this.botSettings.get('botconfs');
        if (!settings) {
            settings = {};
            this.botSettings.set('botconfs', settings);
        }

        const settingsCollection = this.db.collection('botSettings');

        await settingsCollection.updateOne(
            {
                botconfs,
            },
            {
                $set: {
                    settings: val,
                },
            },
        );
        return val;
    }

    async setUser(user, key, val) {
        let settings = this.userSettings.get(user);
        if (!settings) {
            settings = {};
            this.userSettings.set(user, settings);
        }

        settings[key] = val;
        const settingsCollection = this.db.collection('userSettings');

        await settingsCollection.updateOne(
            {
                userId: user,
            },
            {
                $set: {
                    settings,
                },
            },
        );
        return val;
    }

    async setBotsettings(index, key, val) {
        let settings = this.botSettings.get(index);
        if (!settings) {
            settings = {};
        }

        settings[key] = val;
        const settingsCollection = this.db.collection('botSettings');

        await settingsCollection.updateOne(
            {
                botconfs: index,
            },
            {
                $set: {
                    settings,
                },
            },
        );
        return val;
    }

    async removeBotsettings(index, key, val) {
        let settings = this.botSettings.get(index);
        if (!settings) {
            settings = {};
        }

        val = settings[key];
        delete settings[key];
        const settingsCollection = this.db.collection('botSettings');

        await settingsCollection.updateOne(
            {
                botconfs: index,
            },
            {
                $set: {
                    settings,
                },
            },
        );
        return val;
    }

    async clearBotsettings(index) {
        const settingsCollection = this.db.collection('botSettings');
        await settingsCollection.deleteOne({
            botconfs: index,
        });
    }

    getBotsettings(index: string, key: string, defVal?: string) {
        const settings = this.botSettings.get(index);
        if (!key && !defVal) {
            return settings;
        }
        return settings ? (typeof settings[key] === 'undefined' ? defVal : settings[key]) : defVal;
    }

    async reloadBotSettings() {
        try {
            const result = await this.db.collection('botSettings').findOne({
                botconfs: 'botconfs',
            });
            let settings;

            if (!result) {
                // Can't find DB make new one.
                settings = botsettingskeys;
                await this.db.collection('botSettings').insertOne({
                    botconfs: 'botconfs',
                    settings,
                });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            await this.db.collection('botSettings').updateOne(
                {
                    botconfs: 'botconfs',
                },
                {
                    $set: {
                        settings,
                    },
                },
            );

            this.botSettings.set('botconfs', settings);
        } catch (err) {
            console.warn('Error while creating document of bot settings');
            console.warn(err);
        }
    }

    async removeUser(user: string, key: string, val?: any) {
        let settings = this.userSettings.get(user);
        if (!settings) {
            settings = {};
            this.userSettings.set(user, settings);
        }

        val = settings[key];
        settings[key] = undefined;
        const settingsCollection = this.db.collection('userSettings');

        await settingsCollection.deleteOne({
            userId: user,
            settings,
        });
        return val;
    }

    async clearUser(user) {
        if (!this.userSettings.has(user)) return;
        this.userSettings.delete(user);
        const settingsCollection = this.db.collection('userSettings');
        await settingsCollection.deleteOne({
            userId: user,
        });
    }
    setupGuild(guild) {
        if (typeof guild !== 'string') {
            throw new TypeError('The guild must be a guild ID or "global".');
        }
        guild = this.client.guilds.cache.get(guild) || null;
    }
    getGuild(guild: string, key: string, defVal?: string) {
        const settings = this.guildSettings.get(this.getGuildID(guild));
        if (!key && !defVal) {
            return settings;
        }
        return settings ? (typeof settings[key] === 'undefined' ? defVal : settings[key]) : defVal;
    }
    async reloadGuild(id: string, type?: string, value?: string) {
        try {
            const result = await this.db.collection('guildSettings').findOne({
                guildId: id,
            });
            let settings: any;

            if (!result) {
                // Can't find DB make new one.
                settings = guildsettingskeys;
                await this.db.collection('guildSettings').insertOne({
                    guildId: id,
                    settings,
                });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            await this.db.collection('guildSettings').updateOne(
                {
                    guildId: id,
                },
                {
                    $set: {
                        settings,
                    },
                },
            );

            this.guildSettings.set(id, settings);
        } catch (err) {
            console.warn(`Error while creating document of guild ${id}`);
            console.warn(err);
        }
    }
    async fetchGuild(guildId: string, key?: string) {
        let settings = this.guildSettings.get(guildId);

        if (!settings) {
            const result = await this.db.collection('guildSettings').findOne({
                guildId,
            });

            if (result && result.settings) {
                settings = result.settings;
            }
        }

        if (key) {
            return settings[key];
        }

        return settings;
    }

    async reloadUser(id: string) {
        try {
            const result = await this.db.collection('userSettings').findOne({ userId: id });
            let settings;

            if (!result) {
                // Can't find DB make new one.
                settings = usersettingskeys;
                await this.db.collection('userSettings').insertOne({ userId: id, settings });
            }

            if (result && result.settings) {
                settings = result.settings;
            }

            await this.db
                .collection('userSettings')
                .updateOne({ userId: id }, { $set: { settings } });

            this.userSettings.set(id, settings);
        } catch (err) {
            console.warn(`Error while creating document of user ${id}`);
            console.warn(err);
        }
    }

    async fetchUser(userId: string, key?: string) {
        let settings = this.userSettings.get(userId);

        if (!settings) {
            const result = await this.db.collection('userSettings').findOne({
                userId,
            });

            if (result) {
                settings = result;
            }
        }

        if (key) {
            return settings[key];
        }

        return settings;
    }
    async setGuildComplete(guild, val) {
        guild = this.getGuildID(guild);
        this.guildSettings.set(guild, val);

        const settingsCollection = this.db.collection('guildSettings');

        await settingsCollection.updateOne(
            {
                guildId: guild,
            },
            {
                $set: {
                    settings: val,
                },
            },
        );
        return val;
    }
    async clearGuild(guild) {
        guild = this.getGuildID(guild);

        if (!this.guildSettings.has(guild)) return;

        this.guildSettings.delete(guild);
        const settingsCollection = this.db.collection('guildSettings');
        await settingsCollection.deleteOne({
            guildId: guild,
        });
    }
    getDatabase() {
        return this.db;
    }
}
