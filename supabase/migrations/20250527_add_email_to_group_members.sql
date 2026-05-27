-- Migration: Add email column to group_members table
-- Date: 2025-05-27
-- Description: Adds optional email field for group members to enable
--              sending payment reminders and notifications via email.

alter table public.group_members add column if not exists email text;

comment on column public.group_members.email is 'Optional email for sending payment reminders';