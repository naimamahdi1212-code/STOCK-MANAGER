# Duka Stock — Shop Inventory

A small shop inventory tracker: add, edit, and delete stock items, with a live-calculated total inventory value and item count.

## What it does

- Sign in required — only users added in Supabase Auth can access the app
- Add a stock item (name, category, quantity, unit price)
- View all stock, with each row's value (quantity × price) shown automatically
- Edit an item's details or quantity
- Delete an item that's no longer stocked — **admins only**, enforced by database row-level security, not just hidden in the UI
- See total items in stock and total inventory value at the top, recalculated live from the real data — never hardcoded

## Files

- `index.html` — page structure, summary cards, user bar, and the stock form
- `login.html` / `login.js` — sign-in page
- `style.css` — visual styling (slate + amber theme)
- `supabase-client.js` — the one place `SUPABASE_URL` / `SUPABASE_KEY` live
- `app.js` — all app logic: auth guard, role check, and the Supabase data layer
- `inventory-table.sql` — run this **once**, on a fresh project, to create the `inventory` table
- `auth-setup.sql` — run this (safe on an existing project — doesn't touch inventory data) to add user roles and lock down permissions

## Setup

1. Create a Supabase project
2. Run `inventory-table.sql` in the SQL Editor (fresh project only)
3. Run `auth-setup.sql` in the SQL Editor — this creates the `profiles` table, auto-assigns new users the `staff` role, and adds the RLS policies (any signed-in user can view/add/edit, only `role = 'admin'` can delete)
4. In `supabase-client.js`, replace `SUPABASE_URL` and `SUPABASE_KEY` with your project's values (Settings → API)
5. Add your users: Supabase dashboard → **Authentication → Users → Add user** (set an email + password for each person)
6. Promote whoever should be able to delete stock to admin — in the SQL Editor:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
7. Open `login.html` — or push to GitHub and deploy on Vercel/Netlify. Users land on `login.html` first; `index.html` redirects there automatically if nobody's signed in.

## Data model

| Column | Type | Notes |
|---|---|---|
| `id` | bigint (auto) | Primary key |
| `item_name` | text | e.g. "Cooking oil 1L" |
| `category` | text | Groceries, Household, Electricals, Building Materials, Stationery, Other |
| `quantity` | integer | Units currently in stock |
| `price` | numeric | Unit price in KSh |
| `created_at` | timestamptz (auto) | When the item was first added |

Stock value per item and total inventory value are both calculated in `app.js` from `quantity × price` — never stored as their own column, so they can never drift out of sync with the real numbers.
