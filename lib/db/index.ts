import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { ensureDatabaseSchema } from './migrate';

const sqlite = new Database('sqlite.db');
ensureDatabaseSchema(sqlite);

export const db = drizzle(sqlite);
