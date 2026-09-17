/* ===================================================
   Duka Stock — Shop Inventory
   supabase-client.js

   One shared Supabase client, used by both login.html
   and index.html, so the URL/key live in a single place.
   =================================================== */

const SUPABASE_URL = "https://dgjaxqjmxmntcwciyixb.supabase.co";
const SUPABASE_KEY = "sb_publishable_mPPYNO3Hbk0znj7Zwr0ciA_xhQBn3La";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
