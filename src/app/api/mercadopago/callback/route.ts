import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { exchangeOAuthCode, saveUserMpTokens } from '@/lib/mercadopago-client'
import { cookies } from 'next/headers'
import { getAppUrl } from '@/utils/app-url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Resolve the public-facing base URL once for all redirects.
  // Using request.url as base can produce an http://localhost URL
  // when ngrok forwards the request, causing SSL errors on redirect.
  const baseUrl = await getAppUrl()

  // ─── 1. Handle MP auth error ──────────────────────────────
  if (error) {
    console.error('[MP Callback] Auth error from MP:', error)
    return NextResponse.redirect(`${baseUrl}/settings?mp_error=mp_denied`)
  }

  // ─── 2. Validate required params ──────────────────────────
  if (!code || !state) {
    console.error('[MP Callback] Missing code or state')
    return NextResponse.redirect(`${baseUrl}/settings?mp_error=missing_params`)
  }

  // ─── 3. Validate state (CSRF protection) ──────────────────
  const cookieStore = await cookies()
  const savedState = cookieStore.get('mp_oauth_state')?.value

  if (!savedState || savedState !== state) {
    console.error('[MP Callback] State mismatch — posible CSRF attack')
    return NextResponse.redirect(`${baseUrl}/settings?mp_error=csrf`)
  }

  // Clear the state cookie
  cookieStore.delete('mp_oauth_state')

  // ─── 4. Verify user is authenticated ──────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login?redirect=/settings`)
  }

  // ─── 5. Exchange code for tokens ──────────────────────────
  const tokenData = await exchangeOAuthCode(code)

  if (!tokenData) {
    return NextResponse.redirect(`${baseUrl}/settings?mp_error=token_exchange_failed`)
  }

  // ─── 6. Save encrypted tokens to DB ───────────────────────
  const saved = await saveUserMpTokens({
    userId: user.id,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    mpUserId: tokenData.user_id,
    expiresIn: tokenData.expires_in,
  })

  if (!saved) {
    return NextResponse.redirect(`${baseUrl}/settings?mp_error=save_failed`)
  }

  // ─── 7. Redirect to settings with success ─────────────────
  return NextResponse.redirect(`${baseUrl}/settings?mp_success=1`)
}
