# Security

**Production:** NO-GO until P0-SEC and later gates pass.

Canonical audit: [docs/master-plan/12_SECURITY_AUDIT.md](docs/master-plan/12_SECURITY_AUDIT.md)

## Report a vulnerability

Do not open a public issue for secrets, tokens, or exploitable bugs.

Email the repository owner / FitConnect operators, or use GitHub Security Advisories if enabled.

Do not paste production keys, `google-services.json`, keystore passwords, or service-role credentials into chat or tickets.

## Policy (product)

- Strava data is athlete-only. Sessions with `provider = STRAVA` must never appear in social, ranking, or third-party views.
- `STRAVA_CLIENT_SECRET` must never ship in the APK.
- Production must fail closed when auth or demo configuration is missing.
