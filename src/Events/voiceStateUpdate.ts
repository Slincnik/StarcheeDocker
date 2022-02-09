import { VoiceState } from 'discord.js';
import { Event } from '../Classes/Event';
import Client from '../Client';

export default class VoiceStateUpdateEvent extends Event {
    constructor(client: Client) {
        super(client, 'voiceStateUpdate');
    }
    async run(oldState: VoiceState, newState: VoiceState) {
        if (!this.client.provider.isReady) return;
        if (newState.member.user.bot) return;
    }
}
