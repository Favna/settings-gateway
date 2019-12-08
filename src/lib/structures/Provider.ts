import { Piece } from 'klasa';
import { AnyObject, ReadonlyAnyObject, KeyedObject } from '../types';
import { SettingsUpdateResults } from '../settings/SettingsFolder';
import { mergeObjects, makeObject } from '@klasa/utils';
import { SchemaFolder } from '../schema/SchemaFolder';
import { SchemaEntry } from '../schema/SchemaEntry';

export abstract class Provider extends Piece {

	/**
	 * Inserts or creates a table in the database.
	 * @param table The table to check against
	 * @param rows The rows to insert
	 */
	public abstract createTable(table: string, rows?: readonly [string, string][]): Promise<unknown>;

	/**
	 * Deletes or drops a table from the database.
	 * @param table The table to check against
	 */
	public abstract deleteTable(table: string): Promise<unknown>;

	/**
	 * Checks if a table exists in the database.
	 * @param table The table to check against
	 */
	public abstract hasTable(table: string): Promise<boolean>;

	/**
	 * Inserts new entry into a table.
	 * @param table The table to update
	 * @param entry The entry's ID to create
	 * @param data The data to insert
	 */
	public abstract create(table: string, entry: string, data: ReadonlyAnyObject): Promise<unknown>;

	/**
	 * Removes entries from a table.
	 * @param table The table to update
	 * @param entry The ID of the entry to delete
	 */
	public abstract delete(table: string, entry: string): Promise<unknown>;

	/**
	 * Retrieve a single entry from a table.
	 * @param table The table to query
	 * @param entry The ID of the entry to retrieve
	 */
	public abstract get(table: string, entry: string): Promise<IdKeyedObject | null>;

	/**
	 * Retrieve all entries from a table.
	 * @param table The table to query
	 * @param entries The ids to retrieve from the table
	 */
	public abstract getAll(table: string, entries?: readonly string[]): Promise<IdKeyedObject[]>;

	/**
	 * Retrieves all entries' keys from a table.
	 * @param table The table to query
	 */
	public abstract getKeys(table: string): Promise<string[]>;

	/**
	 * Check if an entry exists in a table.
	 * @param table The table to update
	 * @param entry The entry's ID to check against
	 */
	public abstract has(table: string, entry: string): Promise<boolean>;

	/**
	 * Updates an entry from a table.
	 * @param table The table to update
	 * @param entry The entry's ID to update
	 * @param data The data to update
	 */
	public abstract update(table: string, entry: string, data: ReadonlyAnyObject | SettingsUpdateResults): Promise<unknown>;

	/**
	 * Overwrites the data from an entry in a table.
	 * @param table The table to update
	 * @param entry The entry's ID to update
	 * @param data The new data for the entry
	 */
	public abstract replace(table: string, entry: string, data: ReadonlyAnyObject | SettingsUpdateResults): Promise<unknown>;

	/**
	 * Shutdown method, this is called before the piece is unloaded.
	 */
	public async shutdown(): Promise<void> {
		// Optionally defined in extension Classes
	}

	/**
	 * The addColumn method which inserts/creates a new table to the database.
	 * @param table The table to check against
	 * @param entry The SchemaFolder or SchemaEntry added to the schema
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async addColumn(_table: string, _entry: SchemaFolder | SchemaEntry): Promise<void> {
		// Reserved for SQL databases
	}

	/**
	 * The removeColumn method which inserts/creates a new table to the database.
	 * @since 0.5.0
	 * @param table The table to check against
	 * @param columns The column names to remove
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async removeColumn(_table: string, _columns: readonly string[]): Promise<void> {
		// Reserved for SQL databases
	}

	/**
	 * The updateColumn method which alters the datatype from a column.
	 * @param table The table to check against
	 * @param entry The modified SchemaEntry
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async updateColumn(_table: string, _entry: SchemaEntry): Promise<void> {
		// Reserved for SQL databases
	}

	/**
	 * The getColumns method which gets the name of all columns.
	 * @param table The table to check against
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async getColumns(_table: string): Promise<string[]> {
		// Reserved for SQL databases
		return [];
	}

	/**
	 * Parse the input from SettingsGateway for this
	 * @param changes The data that has been updated
	 */
	protected parseUpdateInput(changes: ReadonlyAnyObject | SettingsUpdateResults): KeyedObject {
		if (!Array.isArray(changes)) return changes as KeyedObject;
		const updated: KeyedObject = {};
		for (const change of changes) mergeObjects(updated, makeObject(change.entry.path, change.next));
		return updated;
	}

}

export type IdKeyedObject = AnyObject & { id: string };
