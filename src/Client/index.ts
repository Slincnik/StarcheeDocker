import { Client, Collection, Snowflake } from 'discord.js';
import path from 'path';
import { readdirSync } from 'fs';
import { Config, Vote } from '../Interface';
import { Event } from '../Classes/Event';
import { Command } from '../Classes/Command';
import SettingProvider from '../Utils/Settings';
import Permission from '../Classes/Permission';
import Economic from '../Classes/Economic';
import Mute from '../Classes/Mute';
import DataBaseConnect from '../Utils/db';

export default class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    protected readonly config = process.env;
    public permission: Permission;
    public categories: string[] = [];
    public votes: Map<string, Vote> = new Map();
    public readonly mute: Mute = new Mute(this);
    public readonly economic: Economic = new Economic(this);
    public readonly provider: SettingProvider = new SettingProvider();
    public readonly database: DataBaseConnect = new DataBaseConnect(this.config);

    public async init() {
        await this.database.connect();
        super.login(this.config.TOKEN);
        /* Commands */
        const commandPath = path.join(__dirname, '..', 'Commands');
        readdirSync(commandPath).forEach((dir) => {
            if (dir === 'music') return;
            this.categories.push(dir);
            const commands = readdirSync(`${commandPath}/${dir}`).filter((file) =>
                file.endsWith('.ts'),
            );
            console.log(`[Commandlogs] Loaded ${commands.length} commands of module ${dir}`);
            for (const file of commands) {
                let command: any;
                try {
                    command = require(`${commandPath}/${dir}/${file}`);
                } catch (error) {
                    throw error;
                }
                if (command.default) {
                    command = command.default;
                }
                const cmd = new command(this) as Command;
                this.commands.set(cmd.options.name, cmd);
            }
        });
        /* Events */
        const eventPath = path.join(__dirname, '..', 'Events');
        readdirSync(eventPath)
            .filter((file) => file.endsWith('.ts'))
            .forEach(async (file) => {
                let event: any;
                try {
                    event = require(`${eventPath}/${file}`);
                } catch (error) {
                    throw error;
                }
                if (event.default) {
                    event = event.default;
                }
                const eventRequired = new event(this) as Event;
                this.events.set(eventRequired.name, eventRequired);
                this.on(eventRequired.name, (...args) => eventRequired.run(...args));
            });
    }

    unloadCommand(cmdPath: string, commandName: string) {
        const command =
            this.commands.get(commandName) ||
            this.commands.find((c) => c.options.aliases && c.options.aliases.includes(commandName));
        if (!command) return `Команда ${commandName} не найдена!`;
        delete require.cache[require.resolve(`${cmdPath}/${commandName}.ts`)];
        return false;
    }
    loadCommand(cmdPath: string, commandName: string) {
        let command = require(`${cmdPath}/${commandName}.ts`);
        if (command.default) {
            command = command.default;
        }
        const commandRequired = new command(this) as Command;
        this.commands.set(commandRequired.options.name, commandRequired);
        return false;
    }
}
