import { Message } from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class Ball8Command extends Command {
    constructor(client: Client) {
        super(client, {
            name: '8ball',
            group: 'utility',
            desc: 'магический шар отвечает на ваш вопрос',
            cooldown: 5,
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args.length) return message.reply({ content: 'Задайте свой вопрос' });
        const color = '#FF9900';
        const title = `Вопрос: ${args.join(' ')}`;
        const desc = `Ответ: ${this.doMagic8Ball()}`;
        return message.reply({ embeds: [new Infomessage(color, title, desc).response()] });
    }

    doMagic8Ball() {
        const rand = [
            'Да',
            'Нет',
            'Я не знаю',
            'Скорее нет',
            'Скорее да',
            'Возможно',
            'Никогда',
            'Yep',
            'Спроси еще раз',
            'Духи говорят нет',
            'Не сейчас',
            'Шансы хорошие',
            'Есть сомнения',
            'Не могу сказать',
            'О чем ты вообще?',
            '🤨',
        ];
        return rand[Math.floor(Math.random() * rand.length)];
    }
}
