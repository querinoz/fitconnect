/**
 * TLS for Postgres admin scripts. Local CI has no TLS; remote URLs verify
 * unless the host is Supabase's pooler (see apps/web/lib/db/pg-ssl.ts).
 */
export function postgresSslOption(connectionString) {
  if (!connectionString) return false;
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
  if (isLocal) return false;
  const supabase = /\.supabase\.(co|com)([:/]|$)/.test(connectionString);
  return { rejectUnauthorized: !supabase };
}
