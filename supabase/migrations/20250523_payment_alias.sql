-- Migration: Add payment_alias column to users table
-- Date: 2025-05-23
-- Description: Allows users to store their Mercado Pago alias/CBU/CVU
--              for commission-free transfers.

alter table public.users add column if not exists payment_alias text;

comment on column public.users.payment_alias is 'Alias, CBU or CVU for receiving transfers without MP commission';