export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

export type Service = {
    id: string
    name: string
    logo_url: string | null
    color_hex: string | null
}

export type Group = {
    id: string
    name: string
    creator_id: string
    service_id: string | null
    total_price: number
    billing_cycle_day: number
    created_at: string
    services?: Service | null
    group_members?: GroupMember[]
    payments?: Payment[]
}

export type GroupMember = {
    id: string
    group_id: string
    user_name: string
    whatsapp_number: string | null
    email: string | null
    quota_amount: number
    created_at: string
}

export type Payment = {
    id: string
    group_id: string
    member_id: string
    amount: number
    status: 'PENDING' | 'PAID'
    billing_period: string
    mercado_pago_link: string | null
    preference_id: string | null
    created_at: string
}

export type GroupWithDetails = Group & {
    payment_alias: string | null
}

export type UserProfile = {
    id: string
    email: string | null
    name: string | null
    payment_alias: string | null
    tier: 'free' | 'premium'
    /** Encrypted Mercado Pago access token (AES-256-GCM) */
    mp_access_token_encrypted: string | null
    /** Encrypted Mercado Pago refresh token (AES-256-GCM) */
    mp_refresh_token_encrypted: string | null
    /** Mercado Pago user/collector ID */
    mp_user_id: string | null
    /** Timestamp when the current MP access token expires */
    mp_token_expires_at: string | null
    /** Timestamp when the user first connected their MP account */
    mp_connected_at: string | null
}
