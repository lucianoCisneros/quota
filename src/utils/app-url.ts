/**
 * Returns the public URL of the app.
 *
 * Detection order:
 * 1. `NEXT_PUBLIC_APP_URL` env var (manual override, e.g. in production)
 * 2. `VERCEL_URL` env var (auto-set on Vercel deployments)
 * 3. Auto-detect ngrok tunnel (local dev with ngrok running)
 * 4. Fallback to `http://localhost:3000`
 *
 * @remarks
 * This function is **async** because it may query the ngrok API
 * (http://127.0.0.1:4040) at runtime. All callers must `await` it.
 *
 * For the MP OAuth redirect_uri to work, the URL must also be
 * registered in the Mercado Pago app dashboard under "Redirect URL".
 * See: https://www.mercadopago.com.ar/developers/panel
 */
export async function getAppUrl(): Promise<string> {
  // 1. Explicit override
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }

  // 2. Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Try ngrok (local dev — query the ngrok API)
  const tunnelUrl = await detectNgrokTunnel()
  if (tunnelUrl) return tunnelUrl

  // 4. Fallback
  return 'http://localhost:3000'
}

// ─── Internal ───────────────────────────────────────────

async function detectNgrokTunnel(): Promise<string | null> {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels', {
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) return null

    const data: { tunnels?: { public_url?: string }[] } = await response.json()
    const tunnels = data.tunnels ?? []
    const httpsTunnel = tunnels.find(
      (t) => t.public_url?.startsWith('https://'),
    )
    return httpsTunnel?.public_url?.replace(/\/$/, '') ?? null
  } catch {
    return null
  }
}
