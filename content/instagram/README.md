# FitConnect Instagram — @fitconnectsports

**Contacto:** fitconnectsports@gmail.com

Pipeline para preparar e publicar os 18 posts do kit Elite OS.

## Estado atual do perfil

- **Handle:** [@fitconnectsports](https://www.instagram.com/fitconnectsports/)
- **Posts no perfil:** 0 (conteúdo pronto localmente, aguarda API)
- **Conteúdo preparado:** 46 imagens + 6 reels MP4 + 18 legendas

## Comandos

```powershell
pnpm instagram:prepare          # sync assets + legendas + gerar reels
pnpm instagram:publish -- --post post01 --dry-run
pnpm instagram:status           # verificar token Meta
pnpm instagram:publish -- --post post01   # publicar 1 post
pnpm instagram:publish -- --all           # publicar todos (cuidado!)
```

## Publicar via Meta Graph API (obrigatório)

O Instagram **não permite** login automatizado no browser. A forma oficial é a **Instagram Graph API**:

1. Conta **Business** ou **Creator** ligada a uma **Facebook Page**
2. Criar app em [developers.facebook.com](https://developers.facebook.com)
3. Adicionar produto **Instagram Graph API**
4. Permissões: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
5. Gerar **long-lived access token**
6. Obter `INSTAGRAM_USER_ID` (não é o @handle):

```http
GET /me/accounts?fields=instagram_business_account
```

7. Adicionar ao `.env.local`:

```env
INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_USER_ID=...
INSTAGRAM_PUBLIC_MEDIA_BASE_URL=https://fitconnect-phi.vercel.app/instagram/assets
```

8. **Deploy** para Vercel (assets em `/instagram/assets/` e `/instagram/generated/`)

## Calendário sugerido

| Semana | Terça | Sexta |
|--------|-------|-------|
| 1 | post01 (reel) | post02 (carrossel) |
| 2 | post03 | post04 (reel) |
| 3 | post05 | post06 (reel) |
| … | post07–18 | conforme `LEGENDAS_07_18.md` |

## Estrutura

```
content/instagram/
  manifest.json      # metadados dos 18 posts
  assets/            # PNGs 1080×1350 / capas reel
  captions/          # legendas extraídas dos .md
  generated/         # reels MP4 (ffmpeg Ken Burns)
apps/web/public/instagram/   # cópia servida em produção
```

## Perfil — checklist manual

Na app Instagram (telefone):

- [ ] Foto: `perfil_marca.png` (hexágono Elite OS)
- [ ] Nome: `FitConnect | Treino Gamificado`
- [ ] Bio + link: `https://fitconnect-phi.vercel.app`
- [ ] Categoria: Produto/serviço · Fitness
