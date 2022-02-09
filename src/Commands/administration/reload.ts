import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ReloadCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'reload',
            desc: 'Перезагружает команду',
            group: 'administration',
            lvl: 'Root',
        });
    }
    async execute(message: Message, args: string[]) {
        await message.delete();
        const commandName = args[0];
        if (!commandName) {
            const color = 'RED';
            const title = 'Reload';
            const text = `Введите название команды`;
            return message.channel
                .send({
                    embeds: [new Infomessage(color, title, text).response()],
                })
                .then((m) => {
                    setTimeout(() => m.delete(), 3000);
                });
        }
        const cmd =
            this.client.commands.get(commandName) ||
            this.client.commands.find(
                (c) => c.options.aliases && c.options.aliases.includes(commandName),
            );
        if (!cmd) {
            const color = 'RED';
            const title = 'Reload';
            const text = `Такой команды не существует`;
            return message.channel
                .send({
                    embeds: [new Infomessage(color, title, text).response()],
                })
                .then((m) => {
                    setTimeout(() => m.delete(), 3000);
                });
        }

        try {
            this.client.unloadCommand(`../Commands/${cmd.options.group}`, cmd.options.name);
            this.client.loadCommand(`../Commands/${cmd.options.group}`, cmd.options.name);
            message.channel
                .send({
                    embeds: [
                        new Infomessage(
                            '#00f910',
                            'Reload',
                            `Команда \`${cmd.options.name}\` перезагружена.`,
                        ).response(),
                    ],
                })
                .then((m) => {
                    setTimeout(() => m.delete(), 3000);
                });
            console.log(`${cmd.options.name}.ts - перезагружена.`);
        } catch (e) {
            console.log(e);
            return message.reply('Произошла ошибка, повторите позже').then((m) => {
                setTimeout(() => m.delete(), 3000);
            });
        }
    }
}
