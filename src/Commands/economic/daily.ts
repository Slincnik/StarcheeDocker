import { Message } from 'discord.js';
import ms from 'ms';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';

export default class DailyCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'daily',
            checksystem: 'economic',
            group: 'economic',
            desc: 'Ежедневная награда',
        });
    }
    async execute(message: Message, args: string[]) {
        const currentDailyreminder = this.client.provider.getBotsettings(
            'botconfs',
            'dailyreminder',
        );
        if (!currentDailyreminder[message.author.id]) {
            const dailyreminder = {
                userID: message.author.id,
                remind: Date.now() + 86400000,
            };
            currentDailyreminder[message.author.id] = dailyreminder;
            await this.client.provider.setBotsettings(
                'botconfs',
                'dailyreminder',
                currentDailyreminder,
            );
            const userload = await this.client.economic.findOrCreate(message.member);
            const getUserPremium = await this.client.provider.getUser(message.author.id, 'premium');
            if (getUserPremium.status) userload.coins += 400;
            else userload.coins += 200;
            await this.client.economic.saveAllProfile(message.guild);
            setTimeout(async () => {
                const currentDailyreminderTimeout = this.client.provider.getBotsettings(
                    'botconfs',
                    'dailyreminder',
                );

                delete currentDailyreminderTimeout[message.author.id];

                await this.client.provider.setBotsettings(
                    'botconfs',
                    'dailyreminder',
                    currentDailyreminderTimeout,
                );
            }, 86400000);
            const color = 'GREEN';
            const title = '🎁 Daily 🎁';
            const desc = `Вы получили ${
                getUserPremium.status
                    ? '400 монет \n\n🎁У вас подключен премиум, вы получаете двойную награду'
                    : '200 монет'
            }`;
            return message.channel.send({
                embeds: [new Infomessage(color, title, desc).response()],
            });
        } else {
            const color = 'RED';
            const title = 'Daily';
            const desc = `Вы уже получали ежедневную награду. Приходите через ${ms(
                Number(currentDailyreminder[message.author.id].remind - Date.now()),
            )}`;
            return message.channel.send({
                embeds: [new Infomessage(color, title, desc).response()],
            });
        }
    }
}
