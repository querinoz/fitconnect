# Meta API — guia rápido @fitconnectsports

> Já tens: Instagram ligado ao portfólio FitConnect Sports  
> ID: `17841442379221775`  
> Falta: **access token** da app Meta

## Links directos (abre por ordem)

1. Criar app → https://developers.facebook.com/apps/creation/
2. Graph API Explorer (token) → https://developers.facebook.com/tools/explorer/
3. Token Debugger (long-lived) → https://developers.facebook.com/tools/debug/accesstoken/

---

## Passo A — Criar a app (5 min)

1. Abre https://developers.facebook.com/apps/creation/
2. **Nome da app:** `FitConnect Instagram`
3. **Email de contacto:** `fitconnectsports@gmail.com`
4. **Caso de uso:** escolhe **Outro** → **Próximo**
5. **Tipo de app:** escolhe **Empresa** (Business) → **Criar app**
6. Confirma password / 2FA se pedir

### Adicionar produto Instagram

7. No painel da app, menu esquerdo → **Adicionar produtos** (ou "Casos de uso")
8. Procura **Instagram** → **Configurar**
9. Em **Instagram API with Instagram login** ou **API Graph do Instagram**:
   - Clica **Começar** / **Configurar**
   - Liga a conta **@fitconnectsports**

> Se pedir Página do Facebook: vai ao Business Suite → Páginas → criar "FitConnect Sports" e liga ao Instagram nas definições da conta IG.

---

## Passo B — Gerar token (3 min)

1. Abre https://developers.facebook.com/tools/explorer/
2. Canto superior direito:
   - **Meta App:** seleciona `FitConnect Instagram`
   - **Utilizador ou Página:** o teu utilizador Facebook (admin da conta)
3. Clica **Permissões** → adiciona:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
4. Clica **Generate Access Token** → autoriza tudo
5. Copia o token que aparece (começa por `EAAG` ou `EAA`)

### Tornar long-lived (60 dias)

6. Abre https://developers.facebook.com/tools/debug/accesstoken/
7. Cola o token → **Depurar**
8. Clica **Extend Access Token** (Estender token de acesso)
9. Copia o **novo** token long-lived

---

## Passo C — Colar no projeto

No `.env.local`:

```
INSTAGRAM_ACCESS_TOKEN=EAAG...token_long_lived...
INSTAGRAM_USER_ID=17841442379221775
```

Depois:

```powershell
pnpm instagram:status
pnpm instagram:publish -- --post post01
```

---

## Erros comuns

| Erro | Solução |
|------|---------|
| "Não és programador" | developers.facebook.com → Definições → verificar conta (email + telefone) |
| Token sem permissão publish | Repete Passo B com `instagram_content_publish` |
| IG não aparece no Explorer | Liga @fitconnectsports a uma Página Facebook |
| Media URL invalid | Assets já estão em https://fitconnect-phi.vercel.app/instagram/ |
