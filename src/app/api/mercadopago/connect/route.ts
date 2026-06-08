import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { buildMpConnectUrl } from '@/lib/mercadopago-client'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Generate a random state value and store in a cookie for CSRF protection
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('mp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  // Build and redirect to MP OAuth URL
  const mpUrl = await buildMpConnectUrl(state)

  return NextResponse.redirect(mpUrl)
}
