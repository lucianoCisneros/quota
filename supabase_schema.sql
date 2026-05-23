-- Create standard extensions
create extension if not exists "uuid-ossp";

-- 1. Create Users Table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  whatsapp_number text,
  payment_alias text, -- Alias o CBU para transferencias sin comisión
  tier text default 'free', -- 'free' or 'premium'
  mp_subscription_id text,  -- Mercado Pago Subscription ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security for Users
alter table public.users enable row level security;
create policy "Users can view their own profile." on users for select using (auth.uid() = id);
create policy "Users can update their own profile." on users for update using (auth.uid() = id);

-- 2. Trigger to automatically create a user profile inside 'public.users' when they sign up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. Create Services Table (Netflix, Spotify, etc)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  color_hex text
);

-- Insert common services
insert into public.services (name, color_hex) values 
('Netflix', '#E50914'), 
('Spotify', '#1DB954'), 
('Disney+', '#113CCF'), 
('Amazon Prime', '#00A8E1'),
('Other', '#6366f1');

alter table public.services enable row level security;
create policy "Anyone can see services." on services for select using (true);


-- 4. Create Groups Table
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  creator_id uuid references public.users not null,
  service_id uuid references public.services,
  total_price numeric not null default 0,
  billing_cycle_day integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;
create policy "Users can view their own groups." on groups for select using (auth.uid() = creator_id);
create policy "Users can insert their own groups." on groups for insert with check (auth.uid() = creator_id);
create policy "Users can update their own groups." on groups for update using (auth.uid() = creator_id);
create policy "Users can delete their own groups." on groups for delete using (auth.uid() = creator_id);


-- 5. Create Group Members Table (The friends who pay)
create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups on delete cascade not null,
  user_name text not null,
  whatsapp_number text,
  quota_amount numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.group_members enable row level security;
-- Members can be viewed by the group creator
create policy "Creators can manage their group members." on group_members 
  for all using (
    exists (select 1 from public.groups where groups.id = group_members.group_id and groups.creator_id = auth.uid())
  );


-- 6. Create Payments Table (Historical and Pending)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups on delete cascade not null,
  member_id uuid references public.group_members on delete cascade not null,
  amount numeric not null,
  status text default 'PENDING', -- 'PENDING', 'PAID'
  billing_period text not null, -- YYYY-MM, período de cobro mensual
  mercado_pago_link text,
  preference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index payments_member_group_period_paid_idx
  on public.payments (member_id, group_id, billing_period)
  where status = 'PAID';

create index payments_group_period_idx
  on public.payments (group_id, billing_period, status);

alter table public.payments enable row level security;
create policy "Creators can manage payments." on payments 
  for all using (
    exists (select 1 from public.groups where groups.id = payments.group_id and groups.creator_id = auth.uid())
  );
