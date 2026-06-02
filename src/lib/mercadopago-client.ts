import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'
import { decryptToken, encryptToken } from '@/lib/mp-encryption'
import { getAppUrl } from '@/utils/app-url'

// ─── Types ──────────────────────────────────────────────────

export type MercadoPagoUserConnection = {
  accessToken: string
  mpUserId: string
}

export type MercadoPagoClientResult = {
  client: MercadoPagoConfig
  mpUserId: string
}

// ─── Internal: get encrypted tokens from DB ─────────────────

async function getUserMpRow(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .select(
      'mp_access_token_encrypted, mp_refresh_token_encrypted, mp_user_id, mp_token_expires_at',
    )
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Returns a MercadoPagoConfig client initialized with the user's own
 * stored access token, along with their MP user ID.
 *
 * Returns null if the user has not connected their MP account.
 */
export async function getUserMercadoPagoClient(
  userId: string,
): Promise<MercadoPagoClientResult | null> {
  const row = await getUserMpRow(userId)
  if (!row?.mp_access_token_encrypted) return null

  const accessToken = decryptToken(row.mp_access_token_encrypted)
  const client = new MercadoPagoConfig({ accessToken })

  return { client, mpUserId: row.mp_user_id ?? '' }
}

/**
 * Check if a user has a Mercado Pago account connected.
 */
export async function isUserMpConnected(userId: string): Promise<boolean> {
  const row = await getUserMpRow(userId)
  return Boolean(row?.mp_access_token_encrypted)
}

/**
 * Get Mercado Pago user info (collector ID and email) using the access token.
 */
export async function getMpUserInfo(accessToken: string): Promise<{
  id: string
  email: string
} | null> {
  try {
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    // Use a simple GET to /v1/users/me via the payment client's fetch
    // We do a raw fetch since mercadopago SDK doesn't export a User API
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      id: data.id?.toString() ?? '',
      email: data.email ?? '',
    }
  } catch {
    return null
  }
}

/**
 * Exchange an OAuth authorization code for access + refresh tokens.
 * Calls Mercado Pago's OAuth token endpoint.
 */
export async function exchangeOAuthCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  user_id: string
  expires_in: number
} | null> {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET
  const redirectUri =
    process.env.NEXT_PUBLIC_MP_CONNECT_REDIRECT_URI ??
    `${getAppUrl()}/api/mercadopago/callback`

  if (!clientId || !clientSecret) {
    console.error('[MP OAuth] Faltan MERCADOPAGO_CLIENT_ID o MERCADOPAGO_CLIENT_SECRET')
    return null
  }

  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[MP OAuth] Error exchanging code:', response.status, errorText)
      return null
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user_id: data.user_id?.toString() ?? '',
      expires_in: data.expires_in ?? 15552000, // default: 180 days
    }
  } catch (error) {
    console.error('[MP OAuth] Exchange error:', error)
    return null
  }
}

/**
 * Get an app-level MercadoPagoConfig client using client_credentials grant.
 * This token has limited scope (read-only for payments created by this app)
 * and is used to break the chicken-and-egg problem in the webhook:
 * we need to read the payment (to get external_reference → creator_id)
 * before we can use the creator's own token.
 *
 * On failure (e.g. missing credentials), falls back to returning null.
 */
let _appClient: MercadoPagoConfig | null = null
let _appClientExpiresAt: number = 0

export async function getMpAppClient(): Promise<MercadoPagoConfig | null> {
  // Use cached client if still valid (5 min buffer)
  if (_appClient && Date.now() < _appClientExpiresAt) {
    return _appClient
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[MP App Client] Faltan MERCADOPAGO_CLIENT_ID o MERCADOPAGO_CLIENT_SECRET')
    return null
  }

  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!response.ok) {
      console.error('[MP App Client] Error getting app token:', response.status)
      return null
    }

    const data = await response.json()
    const accessToken: string = data.access_token
    const expiresIn: number = data.expires_in ?? 3600 // default: 1 hour

    _appClient = new MercadoPagoConfig({ accessToken })
    _appClientExpiresAt = Date.now() + (expiresIn - 300) * 1000 // 5 min buffer

    return _appClient
  } catch (error) {
    console.error('[MP App Client] Error:', error)
    return null
  }
}

/**
 * Refresh an expired Mercado Pago access token using the refresh token.
 */
export async function refreshUserToken(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const row = await getUserMpRow(userId)

  if (!row?.mp_refresh_token_encrypted) return false

  const refreshToken = decryptToken(row.mp_refresh_token_encrypted)
  const clientId = process.env.MERCADOPAGO_CLIENT_ID
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET

  if (!clientId || !clientSecret) return false

  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      console.error('[MP Refresh] Error:', response.status)
      return false
    }

    const data = await response.json()

    // Calculate expiration date
    const expiresIn = data.expires_in ?? 15552000 // 180 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Encrypt new tokens and save
    const { error } = await supabase
      .from('users')
      .update({
        mp_access_token_encrypted: encryptToken(data.access_token),
        mp_refresh_token_encrypted: data.refresh_token
          ? encryptToken(data.refresh_token)
          : row.mp_refresh_token_encrypted,
        mp_token_expires_at: expiresAt,
      })
      .eq('id', userId)

    if (error) {
      console.error('[MP Refresh] DB update error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[MP Refresh] Error:', error)
    return false
  }
}

/**
 * Save OAuth tokens for a user (encrypted) after successful authorization.
 */
export async function saveUserMpTokens(params: {
  userId: string
  accessToken: string
  refreshToken: string
  mpUserId: string
  expiresIn: number
}): Promise<boolean> {
  const supabase = createAdminClient()

  const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString()

  const { error } = await supabase.from('users').upsert(
    {
      id: params.userId,
      mp_access_token_encrypted: encryptToken(params.accessToken),
      mp_refresh_token_encrypted: params.refreshToken
        ? encryptToken(params.refreshToken)
        : null,
      mp_user_id: params.mpUserId,
      mp_token_expires_at: expiresAt,
      mp_connected_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('[MP Save] Error:', error)
    return false
  }

  return true
}

/**
 * Remove Mercado Pago connection for a user (disconnect).
 */
export async function disconnectUserMp(userId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('users')
    .update({
      mp_access_token_encrypted: null,
      mp_refresh_token_encrypted: null,
      mp_user_id: null,
      mp_token_expires_at: null,
      mp_connected_at: null,
    })
    .eq('id', userId)

  return !error
}

/**
 * Build the Mercado Pago OAuth authorization URL.
 */
export function buildMpConnectUrl(state: string): string {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID
  const redirectUri =
    process.env.NEXT_PUBLIC_MP_CONNECT_REDIRECT_URI ??
    `${getAppUrl()}/api/mercadopago/callback`

  const params = new URLSearchParams({
    client_id: clientId ?? '',
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: redirectUri,
    state,
  })

  return `https://auth.mercadopago.com.ar/authorization?${params.toString()}`
}
