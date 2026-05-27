-- Migration: Add billing_period column to payments table
-- Date: 2025-05-23
-- Description: Tracks the monthly billing period (YYYY-MM format) for each payment,
--              enabling per-period payment status queries and duplicate prevention.

alter table public.payments add column if not exists billing_period text not null;

comment on column public.payments.billing_period is 'Monthly billing period in YYYY-MM format';