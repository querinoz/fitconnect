import pg from "pg";
import { postgresSslOption } from "./pg-ssl";

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new pg.Pool({
      connectionString: url,
      ssl: postgresSslOption(url),
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
  try {
    const { rows } = await p.query<T>(text, params);
    return rows;
  } catch (err) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (code === "EAI_AGAIN" || code === "ENOTFOUND" || code === "ECONNREFUSED") {
      return [];
    }
    throw err;
  }
}
