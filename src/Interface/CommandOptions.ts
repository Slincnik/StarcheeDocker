import { PermissionResolvable } from 'discord.js';
import { CommandLevel } from '.';

export default interface CommandOptions {
    name: string;
    desc: string;
    group: string;
    aliases?: string[];
    lvl?: keyof CommandLevel;
    format?: string;
    clientPermissions?: PermissionResolvable[];
    userPermissions?: PermissionResolvable[];
    cooldown?: number;
    nsfw?: boolean;
    example?: string | string[];
    isbuild?: boolean;
    checksystem?: string;
}
