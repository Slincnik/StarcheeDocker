import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class ProfileDescriptionCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'profiledescription',
            aliases: ['profiledesc', 'pd'],
            group: 'utility',
            desc: 'Устанавливает описание профиля',
            format: '{description}',
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args.length)
            return message.reply({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Profile Description',
                        'Введите ваше описание <:force:856834783354159114>',
                    ).response(),
                ],
            });
        const desc = args.join(' ');
        if (desc.length > 400)
            return message.reply({
                embeds: [
                    new Infomessage(
                        'RED',
                        'Profile Description',
                        'Ваше описание слишком большое, утихомирьте свой пыл <:ping:880391934970060882>',
                    ).response(),
                ],
            });
        await this.client.provider.setUser(message.author.id, 'description', desc);
        return message.reply({
            embeds: [
                new Infomessage(
                    'GREEN',
                    'Profile Description',
                    'Установил описание профиля <:cooldog:857059041629175809>',
                ).response(),
            ],
        });
    }
}
