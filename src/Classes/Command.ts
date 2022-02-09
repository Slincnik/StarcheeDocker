import { Message } from 'discord.js';
import Client from '../Client';
import { CommandOptions, ICooldown } from '../Interface';
export abstract class Command {
    protected readonly client: Client;
    public readonly options: CommandOptions;
    private _cooldown: Map<string, object> = new Map();
    /**
     * @property {string} name - The name of the command (must be lowercase)
     * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
     * @property {string} group - The ID of the group the command belongs to (must be lowercase)
     * @property {PermissionResolvable[]} [clientPermission] - Permissions required by the client to use the command
     * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
     * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels.
     * @property {string} desc -  A short description of the command
     * @property {string} example - An example of how the command is used
     */
    /**
     * @param {Client} client - The client the command is for
     * @param {CommandInfo} info - The command information
     */

    constructor(client: Client, options: CommandOptions) {
        this.client = client;
        this.options = options;
    }

    /**
     * Execute command
     * @param {Message} message - The message for a guild
     * @param {string[]} args - String arguments accaount
     * @abstract
     * @return {Promise<?Message|?Array<Message> | void>}
     */
    public abstract execute(message: Message, args: string[]): Promise<(Message | ((Message[] | void) | null)) | null>

    onBlock(message: Message, reason: string, data?: any): Promise<Message> {
        switch (reason) {
            case 'clientPermission': {
                return message.reply(`У меня нет прав на выполнение команды ${this.options.name}.`);
            }
            case 'permission': {
                return message.reply(`У вас нет прав на выполнение команды ${this.options.name}.`);
            }
            case 'build': {
                return message.reply(`Комадна ${this.options.name} находится в разработке.`);
            }
            case 'nsfw': {
                return message.reply(
                    `Команда \`${this.options.name}\` может использоваться только в каналах NSFW.`,
                );
            }
            case 'cooldown': {
                return message.reply(`Пожалуйста, подождите ${data.remaining.toFixed(1)} секунд(ы,у)
                перед повторным использованием команды \`${this.options.name}\`.`);
            }
            default:
                return null;
        }
    }

    hasPermission(message: Message): string | boolean {
        if (!this.options.clientPermissions) return true;
        if (message.channel.type === 'GUILD_TEXT' && this.options.clientPermissions) {
            const missing = message.channel
                .permissionsFor(this.client.user)
                .missing(this.options.clientPermissions);
            if (missing.length) {
                return `Команда \`${
                    this.options.name
                }\` требует, чтобы у меня были следующие права: ${missing.join(', ')}`;
            }
        }
        return true;
    }

    checkSystem(message: Message, system: string) {
        switch (system) {
            case 'economic': {
                if (!this.client.provider.getGuild(message.guild.id, 'usersystem').value)
                    return 'Система экономики отключена';
                return true;
            }
            case 'filter': {
                if (!this.client.provider.getGuild(message.guild.id, 'chatfilter').filter)
                    return 'Чат-фильтр отключен';
                return true;
            }
            case 'warnings': {
                if (!this.client.provider.getGuild(message.guild.id, 'warnings').value)
                    return 'Система предупреждений выключена';
                return true;
            }
            default:
                return true;
        }
    }

    can(message: Message): string | boolean {
        if (!this.options.userPermissions) return true;
        if (message.channel.type === 'GUILD_TEXT' && this.options.userPermissions) {
            const missing = message.channel
                .permissionsFor(message.author)
                .missing(this.options.userPermissions);
            if (missing.length) {
                return ` Команда \`${
                    this.options.name
                }\` требует, чтобы у вас были следующие права: ${missing.join(', ')}`;
            }
        }
        return true;
    }

    /**
     * Creates/obtains the cooldown object for a user, if necessary (owners are excluded)
     * @param {string} userID - ID of the user to cooldown for
     * @return {ICooldown | null}
     *
     */
    cooldown(userID: string): ICooldown | null {
        if (!this.options.cooldown) return null;
        let cooldown = this._cooldown.get(userID);
        if (!cooldown) {
            cooldown = {
                start: Date.now(),
                usages: 1,
                timeout: setTimeout(() => {
                    this._cooldown.delete(userID);
                }, this.options.cooldown * 1000),
            };
            this._cooldown.set(userID, cooldown);
        }
        return cooldown as ICooldown;
    }
}
