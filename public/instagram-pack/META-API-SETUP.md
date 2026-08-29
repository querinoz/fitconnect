# Meta Instagram API — App FitConnect

**App Meta:** [2005760616744045](https://developers.facebook.com/apps/2005760616744045/use_cases/customize/?product_route=use_cases&selected_tab=permissions&use_case_enum=INSTAGRAM_BUSINESS&business_id=1730537734878020)  
**Business ID:** `1730537734878020`  
**Conta:** @fitconnectsports

---

## Permissões necessárias (tab Permissions do teu link)

Marca estas no use case **INSTAGRAM_BUSINESS**:

| Permissão (novo scope) | Permissão (legado Facebook Login) | Para quê |
|------------------------|-----------------------------------|----------|
| `instagram_business_basic` | `instagram_basic` | Ler perfil |
| `instagram_business_content_publish` | `instagram_content_publish` | **Publicar posts/stories** |
| `instagram_business_manage_insights` | `instagram_manage_insights` | Métricas (opcional) |

Se usares **Facebook Login** (Page ligada ao IG), adiciona também:
- `pages_show_list`
- `pages_read_engagement`

---

## Passo 1 — Adicionar @fitconnectsports como Tester (modo dev, sem App Review)

1. App Dashboard → **Roles** → **Instagram Testers**
2. Adicionar `fitconnectsports`
3. Na conta Instagram: **Settings → Website permissions → Tester invites → Accept**

Isto permite publicar na tua própria conta **sem App Review**.

---

## Passo 2 — Gerar token

### Opção A — Graph API Explorer (Facebook Login)

1. [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. App: **FitConnect** (`2005760616744045`)
3. **Generate Access Token** com:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
4. Query: `GET /me/accounts?fields=id,name,instagram_business_account,access_token`
5. Copiar:
   - `instagram_business_account.id` → **IG_USER_ID**
   - `access_token` da Page → **IG_ACCESS_TOKEN**

### Opção B — Instagram Business Login (sem Facebook Page)

1. App Dashboard → Instagram → **Set up Instagram business login**
2. OAuth URL com scopes:
   ```
   instagram_business_basic,instagram_business_content_publish
   ```
3. Token devolvido inclui `user_id` → **IG_USER_ID**
4. Access token → **IG_ACCESS_TOKEN**
5. Adicionar secret: `IG_API_HOST=graph.instagram.com`

---

## Passo 3 — Adicionar ao Cursor Environment Secrets

| Secret | Valor |
|--------|-------|
| `IG_USER_ID` | ID da conta Instagram Business |
| `IG_ACCESS_TOKEN` | Page token ou Instagram User token (long-lived) |
| `META_APP_ID` | `2005760616744045` (opcional) |

**Importante:** Reinicia o Cloud Agent após guardar os secrets.

---

## Passo 4 — Descobrir IDs automaticamente

```bash
IG_ACCESS_TOKEN=seu_token node scripts/meta-discover.mjs
```

Mostra `IG_USER_ID`, username, permissões e se pode publicar.

---

## Passo 5 — Publicar

```bash
npm run instagram:verify     # valida credenciais + URLs
npm run instagram:publish    # publica fila prioritária (8 items)
```

---

## Trocar short-lived → long-lived token

```bash
curl -G "https://graph.facebook.com/v21.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=2005760616744045" \
  -d "client_secret=SEU_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

Long-lived Page tokens não expiram se a Page existir.

---

## Verificar manualmente

```bash
# Debug token
curl "https://graph.facebook.com/v21.0/debug_token?input_token=$IG_ACCESS_TOKEN&access_token=$IG_ACCESS_TOKEN"

# Conta IG
curl "https://graph.facebook.com/v21.0/$IG_USER_ID?fields=id,username&access_token=$IG_ACCESS_TOKEN"
```

---

## URLs públicas das imagens ✅

```
https://raw.githubusercontent.com/querinoz/fitconnect/cursor/instagram-api-publish-3f4b/public/instagram-pack/
```

---

## Troubleshooting

| Erro | Solução |
|------|---------|
| `(#200) Permissions error` | Falta `instagram_content_publish` ou `instagram_business_content_publish` |
| `(#10) Application does not have permission` | Aceitar convite de Instagram Tester |
| `(#100) Invalid parameter image_url` | URL da imagem não é pública — verificar GitHub raw |
| Token expirado | Regenerar long-lived token |
| Secrets MISSING no agent | Reiniciar Cloud Agent após adicionar secrets |
