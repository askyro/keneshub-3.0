import Database from 'better-sqlite3';

type Sqlite = InstanceType<typeof Database>;

type TableInfoRow = { name: string };

function tableExists(sqlite: Sqlite, table: string) {
  const row = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(table) as { name?: string } | undefined;
  return row?.name === table;
}

function getColumnNames(sqlite: Sqlite, table: string) {
  if (!tableExists(sqlite, table)) {
    return [];
  }

  const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as TableInfoRow[];
  return rows.map((row) => row.name);
}

function ensurePasswordHashColumn(sqlite: Sqlite) {
  const columns = getColumnNames(sqlite, 'users');
  if (columns.length === 0) {
    return;
  }

  if (columns.includes('password_hash')) {
    return;
  }

  sqlite.exec(`ALTER TABLE users ADD COLUMN password_hash text NOT NULL DEFAULT ''`);
}

export function ensureDatabaseSchema(sqlite: Sqlite) {
  sqlite.pragma('busy_timeout = 5000');

  const apply = sqlite.transaction(() => {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        email text NOT NULL,
        password_hash text NOT NULL DEFAULT '',
        role text NOT NULL,
        created_at integer
      );
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

      CREATE TABLE IF NOT EXISTS debts (
        id text PRIMARY KEY NOT NULL,
        borrower_id text NOT NULL,
        creditor_id text NOT NULL,
        collector_id text,
        amount real NOT NULL,
        currency text DEFAULT 'KZT',
        status text DEFAULT 'active',
        description text,
        created_at integer
      );

      CREATE TABLE IF NOT EXISTS negotiations (
        id text PRIMARY KEY NOT NULL,
        debt_id text NOT NULL,
        status text DEFAULT 'open',
        created_at integer
      );

      CREATE TABLE IF NOT EXISTS messages (
        id text PRIMARY KEY NOT NULL,
        negotiation_id text NOT NULL,
        sender_id text NOT NULL,
        content text NOT NULL,
        created_at integer
      );
    `);

    ensurePasswordHashColumn(sqlite);
  });

  apply.immediate();
}
