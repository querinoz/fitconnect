import pg from "pg";

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new pg.Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 4
    });
  }
  return pool;
}

export async function pgQuery<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const p = getPgPool();
  if (!p) return [];
  const { rows } = await p.query<T>(text, params);
  return rows;
}
