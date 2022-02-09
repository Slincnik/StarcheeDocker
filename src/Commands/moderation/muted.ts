import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class MutedCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'muted',
            desc: 'показывает людей, находящихся в муте',
            group: 'moderation',
        });
    }
    async execute(message: Message, args: string[]) {
        const response = this.client.mute.muted(message);
        if (!response.length)
            message.channel.send({
                embeds: [new Infomessage('GREEN', 'Muted', 'Пользователей в муте нет!').response()],
            });
        else
            message.channel.send({
                embeds: [new Infomessage('RED', 'Muted', response).response()],
            });
    }
}
