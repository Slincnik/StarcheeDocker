import Client from './Client';
import * as dotenv from 'dotenv';
dotenv.config();
const client = new Client({
    intents: [
        'GUILDS',
        'DIRECT_MESSAGES',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MEMBERS',
        'GUILD_SCHEDULED_EVENTS',
    ],
});
client.init();
