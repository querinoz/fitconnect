# WhatsApp official reporting setup

FitConnect sends Phase reports **only** through Meta WhatsApp Cloud API or Twilio WhatsApp.

**Not allowed:** WhatsApp Web automation, stored personal session cookies, scraping, unofficial gateways.

## Recommended integration

**Meta WhatsApp Cloud API** (WhatsApp Business Platform).

Twilio WhatsApp is the supported alternative (`WHATSAPP_PROVIDER=twilio`).

## Environment variables

Copy from `.env.example` into `.env.local` (never commit `.env.local`):

| Variable | Required | Notes |
|----------|----------|--------|
| `WHATSAPP_PROVIDER` | yes | `meta` or `twilio` |
| `WHATSAPP_RECIPIENT` | no | Default `+351933169643` |
| `WHATSAPP_PHONE_NUMBER_ID` | meta | Cloud API phone number id |
| `WHATSAPP_ACCESS_TOKEN` | meta | Cloud API token |
| `TWILIO_ACCOUNT_SID` | twilio | |
| `TWILIO_AUTH_TOKEN` | twilio | |
| `TWILIO_WHATSAPP_FROM` | twilio | e.g. `whatsapp:+14155238886` |

Do not put tokens in docs, git, or chat.

## How to test

```bash
pnpm report:whatsapp:test
pnpm report:whatsapp
```

If credentials are missing the command exits 0 with `WHATSAPP = PENDING_HUMAN`. That does **not** fail repository cleanup.

## Send the Phase 17 report

```bash
node scripts/reporting/send-whatsapp.mjs
```

The outbound body is the concise summary from `docs/phase-17/STATUS.json`. The Markdown report stays in-repo (`docs/phase-17/PHASE_17_FINAL_REPORT.md`). Document upload is not implemented until the configured provider is verified to accept it.

## Security

- Tokens stay in environment variables.
- The sender never logs credential values.
- Recipient override is env-only.
- Failure is non-fatal for engineering gates.
