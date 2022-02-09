import { ColorResolvable, MessageEmbed } from 'discord.js';

export default class Infomessage {
    private color: ColorResolvable;
    private title: string;
    private text: string;
    constructor(color: ColorResolvable, title: string, text: string) {
        this.color = color;
        this.title = title;
        this.text = text;
    }
    /**
     * @returns {MessageEmbed}
     */
    response(): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor(this.color)
            .setFooter({
                text: 'Prod. starchee',
                iconURL:
                    'https://cdn.discordapp.com/attachments/452812015841574912/691962303431835678/nbU2P9BFnSk.jpg',
            })
            .addField(this.title, `${this.text}`)
            .setTimestamp();
        return embed;
    }
}
