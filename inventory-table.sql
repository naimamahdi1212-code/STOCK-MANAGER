-- Run this in Supabase: SQL Editor → New query → paste → Run

drop table if exists inventory;

create table inventory (
  id bigint generated always as identity primary key,
  item_name text not null,
  category text not null,
  quantity integer not null default 0,
  price numeric not null default 0,
  created_at timestamptz default now()
);

-- Turn OFF Row Level Security for this project (re-enable with policies later)
alter table inventory disable row level security;

-- A few starter items (optional — delete this block if you'd rather start empty)
insert into inventory (item_name, category, quantity, price) values
  ('Cooking oil 1L', 'Groceries', 24, 320),
  ('Maize flour 2kg', 'Groceries', 40, 180),
  ('Bar soap', 'Household', 60, 50),
  ('Exercise book', 'Stationery', 100, 30);
