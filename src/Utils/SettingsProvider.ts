/* eslint-disable no-unused-vars, valid-jsdoc */
import { Guild } from 'discord.js';

/**
 * Loads and stores settings associated with guilds
 * @abstract
 */
export default abstract class SettingProvider {
	constructor() {
		if(this.constructor.name === 'SettingProvider') throw new Error('The base SettingProvider cannot be instantiated.');
	}

	/**
	 * Obtains a setting for a guild
	 * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
	 * @param {string} key - Name of the setting
	 * @param {*} [defVal] - Value to default to if the setting isn't set on the guild
	 * @return {*}
	 * @abstract
	 */
	get(guild, key, defVal) { throw new Error(`${this.constructor.name} doesn't have a get method.`); }

	/**
	 * Sets a setting for a guild
	 * @param {Guild|string} guild - Guild to associate the setting with (or 'global')
	 * @param {string} key - Name of the setting
	 * @param {*} val - Value of the setting
	 * @return {Promise<*>} New value of the setting
	 * @abstract
	 */
	set(guild, key, val) { throw new Error(`${this.constructor.name} doesn't have a set method.`); }

	/**
	 * Removes a setting from a guild
	 * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
	 * @param {string} key - Name of the setting
	 * @return {Promise<*>} Old value of the setting
	 * @abstract
	 */
	remove(guild, key) { throw new Error(`${this.constructor.name} doesn't have a remove method.`); }

	/**
	 * Removes all settings in a guild
	 * @param {Guild|string} guild - Guild to clear the settings of
	 * @return {Promise<void>}
	 * @abstract
	 */
	clear(guild) { throw new Error(`${this.constructor.name} doesn't have a clear method.`); }

	/**
	 * Obtains the ID of the provided guild, or throws an error if it isn't valid
	 * @param {Guild|string} guild - Guild to get the ID of
	 * @return {string} ID of the guild, or 'global'
	 */
	getGuildID(guild: string | Guild): string {
		if(guild instanceof Guild) return guild.id;
		if(guild === 'global' || guild === null) return 'global';
		if(typeof guild === 'string' && !isNaN(Number(guild))) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}
