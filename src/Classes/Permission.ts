import ExtendedClient from "../Client";
import { Command } from "./Command";

export default class Permission {
    protected readonly client: ExtendedClient;
    public root: string[] = [];
    constructor(client: ExtendedClient) {
        this.client = client;
        this.update();
    }
    private update() {
        this.client.provider.fetchBotSettings('botconfs', 'root').then(roots => {
            this.root = roots;
        });
        setTimeout(() => this.update(), 3600 * 1000); // 1h
    }
    /**
     * Check user permission to use command
     * @param {string} uid - The userID to check permission
     * @param {string} gid - The guildid to check permission
     * @param {Command} cmd - Command
     */
    check(uid: string, gid: string, cmd: Command) {
        let cmdLvl = 0; // Command Level
        let userLvl = 0; // User Level
        if (!cmd.options.lvl) return cmdLvl = 1;
        if (cmd.options.lvl === 'Moder') cmdLvl = 2;
        if (cmd.options.lvl === 'Admin') cmdLvl = 3;
        if (cmd.options.lvl === 'Root') cmdLvl = 4;
        if (this.root.indexOf(uid) !== -1) return true;
        const result = this.client.provider.getGuild(gid, 'perms');
        if (!result[uid]) userLvl = 1;
        if (result[uid]) {
            if (result[uid].role === 'Moder') userLvl = 2;
            else if (result[uid].role === 'Admin') userLvl = 3;
            else userLvl = 1;
        }
        if (userLvl >= cmdLvl) return true;
        return false;
    }
}