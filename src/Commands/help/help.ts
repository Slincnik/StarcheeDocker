import {
    Message,
    MessageEmbed,
    MessageActionRow,
    MessageSelectMenu,
    GuildMember,
    SelectMenuInteraction,
} from 'discord.js';
import { Command } from '../../Classes/Command';
import Infomessage from '../../Classes/Embed';
import Client from '../../Client';
// import { MessageMenuOption, MessageActionRow, MessageMenu } from 'discord-buttons';
export default class HelpCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'help',
            group: 'help',
            desc: 'Отображает все доступные команды и информацию о них',
            example: 'help || help mute'
        });
    }
    async execute(message: Message, args: string[]) {
        if (!args.length) {
            const formatString = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

            const categories = this.client.categories.map((dir) => {
                const getCommands = this.client.commands
                    .filter((c) => c.options.group === dir)
                    .map((cmd) => {
                        return {
                            name: cmd.options.name,
                            desc: cmd.options.desc,
                        };
                    });
                return {
                    directory: formatString(dir),
                    commands: getCommands,
                };
            });
            const embed = new MessageEmbed().setDescription('Выберите категорию из меню');

            const components = (state: boolean) => {
                return new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId('help-menu')
                        .setPlaceholder('Выберите категорию')
                        .setDisabled(state)
                        .addOptions(
                            categories.map((cmd) => {
                                return {
                                    label: cmd.directory,
                                    value: cmd.directory.toLowerCase(),
                                    description: `Команды из ${cmd.directory} категории`,
                                };
                            }),
                        ),
                );
            };

            const msg = await message.channel.send({
                embeds: [embed],
                components: [components(false)],
            });
            const filter = (inter) => inter.user.id === message.author.id;

            const collector = message.channel.createMessageComponentCollector({
                filter,
                componentType: 'SELECT_MENU',
                time: 30000,
            });

            collector.on('collect', (inter: SelectMenuInteraction) => {
                const [directory] = inter.values;
                const category = categories.find((x) => x.directory.toLowerCase() === directory);
                const categoryEmbed = new MessageEmbed()
                    .setTitle(`${directory.charAt(0).toUpperCase() + directory.slice(1)} commands`)
                    .setDescription('Вот список команд')
                    .addFields(
                        category.commands.map((cmd) => {
                            return {
                                name: `\`${cmd.name}\``,
                                value: cmd.desc,
                                inline: true,
                            };
                        }),
                    );
                inter.update({ embeds: [categoryEmbed] });
                collector.resetTimer();
            });

            collector.on('end', () => {
                msg.edit({ components: [components(true)] });
            });
        } else {
            const prefix = await this.client.provider.fetchGuild(message.guild.id, 'prefix');
            const data = [];
            const name = args.join(' ');
            const command =
                this.client.commands.get(name) ||
                this.client.commands.find((cm) => cm.options.aliases?.includes(name));
            if (!command) {
                const color = 'RED';
                const title = `Help`;
                const text = 'Не нашёл данную команду!';
                return message.channel.send({
                    embeds: [new Infomessage(color, title, text).response()],
                });
            }
            data.push(`**Name**: ${command.options.name}`);
            if (command.options.aliases)
                data.push(`**Aliases**: ${command.options.aliases?.join(', ')}`);
            if (command.options.desc) data.push(`**Description**: ${command.options.desc}`);
            if (command.options.format)
                data.push(`**Format**: \`${prefix}${command.options.format}\``);
            if (command.options.example)
                data.push(
                    `**Example**: \`${prefix}${command.options.name} ${command.options.example}\``,
                );
            message.channel.send({
                content: data.join('\n'),
            });
        }
    }
}
