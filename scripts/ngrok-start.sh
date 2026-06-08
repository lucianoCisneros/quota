#!/usr/bin/env bash
#
# ngrok-start.sh
# ────────────────────────────────────────────────────────────
# Starts ngrok on port 3000, reads the generated tunnel URL
# from the ngrok API, and updates .env.local so that
#   NEXT_PUBLIC_APP_URL
#   NEXT_PUBLIC_MP_CONNECT_REDIRECT_URI
# point to the live ngrok endpoint.
#
# Usage:
#   chmod +x scripts/ngrok-start.sh
#   ./scripts/ngrok-start.sh
#
# Requires:
#   - ngrok binary in ./ngrok-bin/ (or on $PATH)
#   - jq (for JSON parsing) — install with: sudo apt install jq  /  brew install jq
# ────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"
NGROK_BIN="$ROOT_DIR/ngrok-bin/ngrok"

# ─── 1. Locate ngrok binary ────────────────────────────────
if [ -x "$NGROK_BIN" ]; then
    NGROK_CMD="$NGROK_BIN"
elif command -v ngrok &>/dev/null; then
    NGROK_CMD="ngrok"
else
    echo "❌ ngrok not found at $NGROK_BIN or on \$PATH"
    echo "   Download from https://ngrok.com/download"
    exit 1
fi

echo "🔍 Using ngrok: $NGROK_CMD"

# ─── 2. Kill any existing ngrok process ────────────────────
pkill ngrok 2>/dev/null || true
sleep 1

# ─── 3. Start ngrok in background ──────────────────────────
echo "🚀 Starting ngrok on port 3000 …"
"$NGROK_CMD" http 3000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# ─── 4. Wait for ngrok to be ready (poll the API) ──────────
echo "⏳ Waiting for ngrok tunnel …"
for i in $(seq 1 15); do
    sleep 1
    TUNNEL_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null \
        | python3 -c "import sys,json; tunnels=json.load(sys.stdin).get('tunnels',[]); print([t['public_url'] for t in tunnels if t['public_url'].startswith('https://')][0])" 2>/dev/null || echo "")
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
done

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ ngrok failed to start. Log output:"
    cat /tmp/ngrok.log
    exit 1
fi

echo "✅ ngrok tunnel ready: $TUNNEL_URL"

# ─── 5. Update .env.local ──────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  No .env.local found; creating from .env.example"
    cp "$ROOT_DIR/.env.example" "$ENV_FILE"
fi

# Helper: update or append a variable in .env.local
update_env_var() {
    local key="$1"
    local value="$2"
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Use | as sed delimiter to avoid issues with /
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

update_env_var "NEXT_PUBLIC_APP_URL" "$TUNNEL_URL"
update_env_var "NEXT_PUBLIC_MP_CONNECT_REDIRECT_URI" "${TUNNEL_URL}/api/mercadopago/callback"

echo "📝 Updated .env.local:"
echo "   NEXT_PUBLIC_APP_URL=$TUNNEL_URL"
echo "   NEXT_PUBLIC_MP_CONNECT_REDIRECT_URI=${TUNNEL_URL}/api/mercadopago/callback"

# ─── 6. Also update the Mercado Pago Redirect URI in the MP app ──
echo ""
echo "🔔 IMPORTANTE: Si cambiaron las credenciales o creaste una app nueva,"
echo "   asegurate de agregar esta URL en el panel de Mercado Pago:"
echo ""
echo "   👉 Redirect URL: ${TUNNEL_URL}/api/mercadopago/callback"
echo ""
echo "   Panel: https://www.mercadopago.com.ar/developers/panel"
echo ""

# Save PID so we can kill later
echo "$NGROK_PID" > /tmp/ngrok.pid

echo "✨ ngrok PID $NGROK_PID corriendo en: $TUNNEL_URL"
echo "   Para detenerlo: pkill ngrok  o  kill \$NGROK_PID"