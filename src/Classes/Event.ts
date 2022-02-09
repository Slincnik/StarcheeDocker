import { ClientEvents } from 'discord.js';
import Client from '../Client';
export abstract class Event {
    protected readonly client: Client;
    public name: keyof ClientEvents;
    constructor(client: Client, name: keyof ClientEvents) {
        this.client = client;
        this.name = name;
    }
    public abstract run(...args: any[]): void;
}