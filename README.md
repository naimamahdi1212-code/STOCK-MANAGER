# Duka Stock — Shop Inventory

A small shop inventory tracker: add, edit, and delete stock items, with a live-calculated total inventory value and item count.

## What it does

- Add a stock item (name, category, quantity, unit price)
- View all stock, with each row's value (quantity × price) shown automatically
- Edit an item's details or quantity
- Delete an item that's no longer stocked
- See total items in stock and total inventory value at the top, recalculated live from the real data — never hardcoded

## Files

- `index.html` — page structure, summary cards, and the stock form
- `style.css` — visual styling (slate + amber theme)
- `app.js` — all app logic, including the Supabase data layer
- `inventory-table.sql` — run this in Supabase's SQL Editor to create the `inventory` table

## Setup

1. Create a Supabase project
2. Run `inventory-table.sql` in the SQL Editor
3. In `app.js`, replace `SUPABASE_URL` and `SUPABASE_KEY` with your project's values (Settings → API)
4. Open `index.html` — or push to GitHub and deploy on Vercel/Netlify

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
