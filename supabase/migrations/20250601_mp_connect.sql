-- Migration: Add Mercado Pago OAuth columns to users table
-- Date: 2025-06-01
-- Description: Enables multi-tenant Mercado Pago by storing each user's
--              encrypted MP access/refresh tokens (obtained via MP Connect OAuth).
--              Each user connects their own MP account to receive payments directly.

alter table public.users add column if not exists mp_access_token_encrypted text;
alter table public.users add column if not exists mp_refresh_token_encrypted text;
alter table public.users add column if not exists mp_user_id text;
alter table public.users add column if not exists mp_token_expires_at timestamp with time zone;
alter table public.users add column if not exists mp_connected_at timestamp with time zone;

comment on column public.users.mp_access_token_encrypted is 'Mercado Pago access token, AES-256-GCM encrypted. Used to create payment preferences on behalf of this user.';
comment on column public.users.mp_refresh_token_encrypted is 'Mercado Pago refresh token, AES-256-GCM encrypted. Used to obtain new access tokens when they expire (~180 days).';
comment on column public.users.mp_user_id is 'Mercado Pago user ID (collector ID) — identifies the MP account connected.';
comment on column public.users.mp_token_expires_at is 'Timestamp when the current MP access token expires. Auto-refreshed via cron.';
comment on column public.users.mp_connected_at is 'Timestamp when the user first connected their MP account.';
