import {
    ButtonInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from 'discord.js';

const pagination = async (message: Message, pages: string[], timeout = 10000) => {
    if (!message) throw new Error('Message must be given.');
    if (!pages) throw new Error('Pages must be given.');
    let page = 0;
    const components = (disabled = false) => {
        return new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId('previousbtn')
                .setEmoji('◀️')
                .setDisabled(disabled)
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('nextbtn')
                .setEmoji('▶️')
                .setDisabled(disabled)
                .setStyle('SUCCESS'),
        ]);
    };
    const pagEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setFooter({
            text: `Page ${page + 1} / ${pages.length}`
        })
        .setDescription(pages[page])
        .setTimestamp();
    const curPage = await message.reply({
        embeds: [pagEmbed],
        components: [components(false)],
    });
    const filter = (inter) => inter.user.id === message.author.id;

    const collector = curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
        switch (i.customId) {
            case 'previousbtn': {
                page = page > 0 ? --page : pages.length - 1;
                pagEmbed
                    .setDescription(pages[page])
                    .setFooter({
                        text: `Page ${page + 1} / ${pages.length}`
                    });
                break;
            }
            case 'nextbtn': {
                page = page + 1 < pages.length ? ++page : 0;
                pagEmbed
                    .setDescription(pages[page])
                    .setFooter({
                        text: `Page ${page + 1} / ${pages.length}`
                    });
                break;
            }
            default:
                break;
        }
        i.deferUpdate();
        curPage.edit({
            embeds: [pagEmbed],
            components: [components(false)],
        });
        collector.resetTimer();
    });

    collector.on('end', () => {
        curPage.edit({
            components: [components(true)],
        });
    });
};
export default pagination;
