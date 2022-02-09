import { ApplicationCommandOptionData } from "discord.js";

export default interface SlashCommandOptions {
    name: string;
    userPermissions?: string;
    description: string;
    nsfw?: boolean;
    options?: ApplicationCommandOptionData[]
    isbuild?: boolean;
}
