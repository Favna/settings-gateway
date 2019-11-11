import { SettingsFolder, SettingsExistenceStatus } from './SettingsFolder';
import { Gateway } from '../gateway/Gateway';

export class Settings extends SettingsFolder {

	public readonly id: string;
	public readonly gateway: Gateway;
	public readonly target: unknown;
	public existenceStatus: SettingsExistenceStatus;

	public constructor(gateway: Gateway, target: unknown, id: string) {
		super(gateway.schema);
		this.id = id;
		this.gateway = gateway;
		this.target = target;
		this.existenceStatus = SettingsExistenceStatus.Unsynchronized;
		this._init(this, this.schema);
	}

	/**
	 * Creates a clone of this instance.
	 */
	public clone(): Settings {
		const clone = new Settings(this.gateway, this.target, this.id);
		clone._patch(this.toJSON());
		return clone;
	}

	/**
	 * Sync the data from the database with the cache.
	 * @param force Whether or not this should force a database synchronization
	 */
	public async sync(force = this.existenceStatus === SettingsExistenceStatus.Unsynchronized): Promise<this> {
		// If not force and the instance has already been synchronized with the database, return this
		if (!force && this.existenceStatus !== null) return this;

		// Push a synchronization task to the request handler queue
		const data = await this.gateway.requestHandler.push(this.id);
		if (data) {
			this.existenceStatus = SettingsExistenceStatus.Exists;
			this._patch(data);
			this.gateway.client.emit('settingsSync', this);
		} else {
			this.existenceStatus = SettingsExistenceStatus.NotExists;
		}

		return this;
	}

	/**
	 * Delete this entry from the database and clean all the values to their defaults.
	 */
	public async destroy(): Promise<this> {
		await this.sync();
		if (this.existenceStatus === SettingsExistenceStatus.Exists) {
			const { provider } = this.gateway;
			if (provider === null) throw new Error('The provider was not available during the destroy operation.');
			await provider.delete(this.gateway.name, this.id);
			this.gateway.client.emit('settingsDelete', this);
			this._init(this, this.schema);
			this.existenceStatus = SettingsExistenceStatus.NotExists;
		}

		return this;
	}

}
