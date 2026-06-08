-- Migration: Add last_name column to users table
-- Date: 2025-06-08
-- Description: Adds last_name field to store user's last name/surname

alter table public.users add column if not exists last_name text;

comment on column public.users.last_name is 'Apellido del usuario';