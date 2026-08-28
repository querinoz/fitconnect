# Meta Instagram API — Setup & Publish

## ⚠️ Bloqueio atual

As credenciais **IG_USER_ID** e **IG_ACCESS_TOKEN** não estão disponíveis neste ambiente Cloud Agent.

**Ação necessária:** Adicionar ao **Cursor → Environment → Secrets**:

| Secret | Onde obter |
|--------|------------|
| `IG_USER_ID` | [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/) → `me/accounts` → Instagram Business Account ID |
| `IG_ACCESS_TOKEN` | Page Access Token (long-lived) com `instagram_basic` + `instagram_content_publish` |

## URLs públicas das imagens ✅

Imagens acessíveis via GitHub (requerido pela Meta API):

```
https://raw.githubusercontent.com/querinoz/fitconnect/cursor/instagram-api-publish-3f4b/public/instagram-pack/
```

Após merge em `main`, Vercel também servirá em:

```
https://fitconnect-phi.vercel.app/instagram-pack/
```

## Publicar (após adicionar secrets)

```bash
# Simular
npm run instagram:publish:dry

# Publicar fila prioritária (8 items: carousels + posts + stories)
npm run instagram:publish
```

## Fila prioritária automática

1. Carousel educativo (HRV) — saves
2. Story poll HRV
3. Post mockup dashboard
4. Carousel mockups produto
5. Carousel diversidade
6. Story swipe-up
7. Post lifestyle
8. Carousel devices

Intervalo: 90s entre posts feed, 30s entre stories (evita rate limit).

## Publicar tudo manualmente

```bash
# Carousel específico
node scripts/publish-instagram.mjs --carousel 07-educational-fitconnect

# Post único
node scripts/publish-instagram.mjs --post Posts/22-mockup-athlete-dashboard.png
```

## Obter credenciais Meta (passo a passo)

1. Aceder a https://developers.facebook.com/apps/
2. Selecionar a app FitConnect
3. **Instagram → API setup with Instagram login**
4. Ligar conta @fitconnectsports (Business/Creator)
5. **Graph API Explorer** → Generate Token com:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
6. Trocar por long-lived token (60 dias):
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-token}
   ```
7. Obter Instagram Business Account ID:
   ```
   GET /{page-id}?fields=instagram_business_account
   ```

## Verificar token

```bash
curl "https://graph.facebook.com/v21.0/me/accounts?access_token=$IG_ACCESS_TOKEN"
curl "https://graph.facebook.com/v21.0/$IG_USER_ID?fields=id,username&access_token=$IG_ACCESS_TOKEN"
```
