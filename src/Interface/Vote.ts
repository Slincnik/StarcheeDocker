import { DMChannel, NewsChannel } from 'discord.js';
import { TextChannel } from 'discord.js';

export default interface NewVote {
    count: number;
    users: string[];
    guild: string;
    channel: TextChannel | DMChannel | NewsChannel;
    start: number;
    timeout: any;
}
