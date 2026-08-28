#!/usr/bin/env bash
# Publicar Instagram — executar LOCALMENTE após configurar secrets
# Uso: export IG_USER_ID=... IG_ACCESS_TOKEN=... && ./scripts/publish-now.sh

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${IG_USER_ID:-}" || -z "${IG_ACCESS_TOKEN:-}" ]]; then
  echo "❌ Defina IG_USER_ID e IG_ACCESS_TOKEN"
  echo ""
  echo "Obter no Graph API Explorer (app 2005760616744045):"
  echo "  GET /me/accounts?fields=instagram_business_account,access_token"
  echo ""
  echo "Depois:"
  echo "  export IG_USER_ID=<instagram_business_account.id>"
  echo "  export IG_ACCESS_TOKEN=<page access_token>"
  echo "  ./scripts/publish-now.sh"
  exit 1
fi

echo "🔍 Verificando..."
npm run instagram:verify

echo ""
echo "📤 Publicando fila prioritária (8 items)..."
npm run instagram:publish

echo ""
echo "✅ Concluído! Verifica @fitconnectsports"
