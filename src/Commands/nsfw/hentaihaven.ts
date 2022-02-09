import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../Classes/Command';
import Client from '../../Client';
import { JSDOM } from 'jsdom';

export default class HentaiHavenCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'hentaihaven',
            group: 'nsfw',
            aliases: ['hh'],
            isbuild: true,
            desc: 'Рандомное видео с Hentai Haven`a',
            nsfw: true,
        });
    }
    async execute(message: Message, args: string[]) {
        try {
            message.reply('Ищю годноту').then((msg) => {
                JSDOM.fromURL('https://hentaihaven.org').then(async (res) => {
                    const elements = res.window.document.querySelectorAll('head > script');
                    const element = Array.from(elements).filter((elem) =>
                        elem.textContent.startsWith('/*  */\nvar Pukka = '),
                    )[0];
                    const Pukka = JSON.parse(
                        element.textContent.replace(
                            /^\/\* {2}\*\/\nvar Pukka = |\;\n\/\* {2}\*\/$/g,
                            '',
                        ),
                    );
                    const randomcategory =
                        Pukka.category_links[
                            Math.floor(Math.random() * (Pukka.category_links.length - 1))
                        ];
                    await JSDOM.fromURL(randomcategory).then((resource) => {
                        const { document } = resource.window;
                        const title =
                            document.getElementsByClassName('archive-title')[0].textContent;
                        const videos = document.getElementsByClassName('hidden animate_video');
                        const videoselection = Math.floor(Math.random() * (videos.length - 1)); // select a random video off the page
                        const videourl = videos[videoselection].attributes[1].value;
                        const thumbnailurl =
                            document.getElementsByClassName('hidden animate_image')[videoselection]
                                .attributes[1].value ||
                            document.getElementsByClassName('hidden solid_image')[videoselection]
                                .attributes[1].value ||
                            document.getElementsByClassName('lazy attachment-medium post-image')[
                                videoselection
                            ].attributes[4].value;
                        const embed = new MessageEmbed()
                            .setImage(thumbnailurl)
                            .setTitle(title)
                            .setURL(videourl)
                            .setFooter({
                                text: videourl
                            })
                            .setColor('BLUE');
                        return msg.edit({
                            embeds: [embed],
                        });
                    });
                });
            });
        } catch (error) {
            return message.reply('Не нашел годноту :(');
        }
    }
}
