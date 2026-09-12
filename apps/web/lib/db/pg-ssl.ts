/**
 * TLS for Postgres.
 *
 * Local CI / docker Postgres has no TLS. Other remotes must verify certificates.
 * Supabase's pooler currently presents a chain that Node's Mozilla store rejects
 * (`self-signed certificate in certificate chain`). We still wrap the socket in
 * TLS (passing an `ssl` object); we cannot fail-closed on that CA until it is
 * pinned. Non-Supabase remotes verify.
 */
export function postgresSslOption(
  connectionString: string | undefined
): false | { rejectUnauthorized: boolean } {
  if (!connectionString) return false;
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
  if (isLocal) return false;
  const supabase = /\.supabase\.(co|com)([:/]|$)/.test(connectionString);
  return { rejectUnauthorized: !supabase };
}
