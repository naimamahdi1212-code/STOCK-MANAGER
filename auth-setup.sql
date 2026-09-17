-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Safe to run on your existing project — it does NOT touch or drop
-- the inventory table or its data, it only adds auth + permissions.

-- ============================================================
-- PROFILES — one row per signed-in user, holds their role
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- A signed-in user can read their own profile row (the app needs this
-- to know whether to show admin-only controls like Delete)
drop policy if exists "profiles: read own row" on profiles;
create policy "profiles: read own row"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Auto-create a 'staff' profile row whenever a new user is added
-- (Authentication → Users → Add user in the Supabase dashboard)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already exist in auth.users
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Promote someone to admin (run manually, once, per admin):
--
--   update profiles set role = 'admin' where email = 'you@example.com';
--
-- Everyone else defaults to 'staff' and can view/add/edit stock
-- but cannot delete items.
-- ------------------------------------------------------------

-- ============================================================
-- INVENTORY — lock down with row level security
-- ============================================================

alter table inventory enable row level security;

drop policy if exists "inventory: signed-in users can read" on inventory;
create policy "inventory: signed-in users can read"
  on inventory for select
  to authenticated
  using (true);

drop policy if exists "inventory: signed-in users can insert" on inventory;
create policy "inventory: signed-in users can insert"
  on inventory for insert
  to authenticated
  with check (true);

drop policy if exists "inventory: signed-in users can update" on inventory;
create policy "inventory: signed-in users can update"
  on inventory for update
  to authenticated
  using (true)
  with check (true);

-- Only admins can delete — enforced here in the database, not just
-- by hiding the button in the browser
drop policy if exists "inventory: admins can delete" on inventory;
create policy "inventory: admins can delete"
  on inventory for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
