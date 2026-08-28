# FitConnect Ops — estado 2026-08-28

**Conta canónica:** `fitconnectsports@gmail.com`  
**Instagram:** [@fitconnectsports](https://www.instagram.com/fitconnectsports/)  
**Prod URL:** https://fitconnect-phi.vercel.app (preview — não produção final)

---

## Infraestrutura

| Serviço | Conta / ID | Estado |
|---------|------------|--------|
| Gmail / Meta | fitconnectsports@gmail.com | ✅ Registado |
| Meta Business | FitConnect Sports (`1730537734878020`) | ✅ IG ligado |
| Meta Developers | App **FitConnect** | ✅ Token user + publish |
| Instagram API | `17841442379221775` | ✅ Status OK |
| Supabase | `beuiammeedpovdkmhluw` | ✅ Healthy |
| Vercel | querinoz/fitconnect | ✅ Deploy prod OK |
| Stripe | FitConnect \| LiteOS (test) | ⚠️ Chaves novas — colar em `.env.local` |

---

## Instagram — playbook compliance

| Item | Estado | Nota |
|------|--------|------|
| Token `instagram_content_publish` | ✅ | Confirmado via debug_token |
| Assets HTTPS públicos | ✅ | `/instagram/assets` + `/generated` |
| post01 legenda | ✅ | Strava removido |
| post02–05 legendas | ✅ | Strava + `#lancamento` corrigidos |
| **post03 publicado** | ⚠️ | Live com legenda antiga (Strava) — editar no IG |
| **post01 reel** | ❌ | Falha publish — falta Página FB ligada |
| Ordem catálogo | ⚠️ | post03 saiu antes do post01 |
| Nome perfil | ⚠️ | `FitConnect EliteOS` → target: `FitConnect \| Treino Gamificado` |
| Link bio | ⚠️ | Só editável na app móvel |
| Cadência | ✅ | 1 post (dentro do limite) |

---

## Acções humanas pendentes

1. **Página Facebook** → criar "FitConnect Sports" e ligar ao @fitconnectsports
2. **Token novo** após ligar Página → republicar post01
3. **Editar/apagar post03** no Instagram (legenda viola playbook Strava)
4. **Bio Instagram** (app móvel): link + nome + foto perfil
5. **Stripe** — colar chaves completas `pk_test_51U9MOU...` / `sk_test_51U9MOU...` em `.env.local` + Vercel env
6. **Supabase RLS** — 6 avisos críticos nas tabelas Strava (resolver antes de go-live)

---

## Contacto no código

- `apps/web/lib/site/contact.ts` — email + Instagram canónicos
- `NEXT_PUBLIC_FITCONNECT_CONTACT_EMAIL=fitconnectsports@gmail.com`
