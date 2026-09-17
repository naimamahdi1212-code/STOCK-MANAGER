/* ===================================================
   Duka Stock — Shop Inventory
   app.js

   BACKEND: Supabase
   All four operations (Read, Create, Update, Delete) are
   connected to a real Supabase "inventory" table.
   =================================================== */

// ---------------------------------------------------
// SUPABASE SETUP — fill these 2 values in during class
// ---------------------------------------------------

const SUPABASE_URL = "https://dgjaxqjmxmntcwciyixb.supabase.co";
const SUPABASE_KEY = "sb_publishable_mPPYNO3Hbk0znj7Zwr0ciA_xhQBn3La";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------
// DATA LAYER
// ---------------------------------------------------

async function getItems() {
  const { data, error } = await supabaseClient
    .from('inventory')
    .select('*')
    .order('item_name', { ascending: true });

  if (error) throw error;
  return data;
}

async function createItem(entry) {
  const { data, error } = await supabaseClient
    .from('inventory')
    .insert([entry])
    .select();

  if (error) throw error;
  return data[0];
}

async function updateItem(id, updatedFields) {
  const { error } = await supabaseClient
    .from('inventory')
    .update(updatedFields)
    .eq('id', id);

  if (error) throw error;
}

async function deleteItem(id) {
  const { error } = await supabaseClient
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---------------------------------------------------
// DOM REFERENCES
// ---------------------------------------------------

const form = document.getElementById('entryForm');
const itemNameInput = document.getElementById('itemName');
const categoryInput = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const editingIdInput = document.getElementById('editingId');

const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const entriesList = document.getElementById('entriesList');
const emptyState = document.getElementById('emptyState');
const itemCountEl = document.getElementById('itemCount');
const totalValueEl = document.getElementById('totalValue');

// ---------------------------------------------------
// RENDERING
// ---------------------------------------------------

function formatCurrency(amount) {
  return `KSh ${Number(amount).toLocaleString()}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function renderItems() {
  let items;
  try {
    items = await getItems();
  } catch (err) {
    console.error("Couldn't load inventory from Supabase:", err);
    entriesList.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = "Couldn't load stock — check the console for the error.";
    return;
  }

  entriesList.innerHTML = '';

  if (items.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = "No stock recorded yet. Add your first item above.";
  } else {
    emptyState.hidden = true;

    items.forEach(item => {
      const value = Number(item.quantity) * Number(item.price);
      const row = document.createElement('div');
      row.className = 'entry-row';
      row.innerHTML = `
        <span class="entry-name">${escapeHtml(item.item_name)}</span>
        <span class="entry-category">${escapeHtml(item.category)}</span>
        <span class="entry-qty">${item.quantity}</span>
        <span class="entry-price">${formatCurrency(item.price)}</span>
        <span class="entry-value">${formatCurrency(value)}</span>
        <span class="entry-actions">
          <button type="button" class="edit-btn" data-id="${item.id}">Edit</button>
          <button type="button" class="delete-btn" data-id="${item.id}">Delete</button>
        </span>
      `;
      entriesList.appendChild(row);
    });
  }

  updateSummary(items);
}

// Both summary numbers are calculated fresh from the current list every
// time — never stored, so they can't drift out of sync with real stock.
function updateSummary(items) {
  itemCountEl.textContent = items.length;
  const totalValue = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  );
  totalValueEl.textContent = formatCurrency(totalValue);
}

// ---------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const entry = {
    item_name: itemNameInput.value.trim(),
    category: categoryInput.value,
    quantity: Number(quantityInput.value),
    price: Number(priceInput.value),
  };

  if (!entry.item_name || !entry.category || entry.quantity < 0 || entry.price < 0) {
    return; // required attributes on the inputs also guard this
  }

  const editingId = editingIdInput.value;

  try {
    if (editingId) {
      await updateItem(editingId, entry);
      exitEditMode();
    } else {
      await createItem(entry);
    }
  } catch (err) {
    console.error("Couldn't save item to Supabase:", err);
    alert("Couldn't save that item — check the console for the error.");
    return;
  }

  form.reset();
  await renderItems();
});

entriesList.addEventListener('click', async (event) => {
  const id = event.target.dataset.id;
  if (!id) return;

  if (event.target.classList.contains('delete-btn')) {
    const confirmed = confirm('Remove this item from stock? This can\'t be undone.');
    if (!confirmed) return;

    try {
      await deleteItem(id);
      await renderItems();
    } catch (err) {
      console.error("Couldn't delete item in Supabase:", err);
      alert("Couldn't delete that item — check the console for the error.");
    }
  }

  if (event.target.classList.contains('edit-btn')) {
    enterEditMode(id);
  }
});

cancelEditBtn.addEventListener('click', () => {
  exitEditMode();
  form.reset();
});

async function enterEditMode(id) {
  const items = await getItems();
  const item = items.find(i => String(i.id) === String(id));
  if (!item) return;

  itemNameInput.value = item.item_name;
  categoryInput.value = item.category;
  quantityInput.value = item.quantity;
  priceInput.value = item.price;
  editingIdInput.value = item.id;

  submitBtn.textContent = 'Save changes';
  cancelEditBtn.hidden = false;

  itemNameInput.focus();
}

function exitEditMode() {
  editingIdInput.value = '';
  submitBtn.textContent = 'Add item';
  cancelEditBtn.hidden = true;
}

// ---------------------------------------------------
// INIT
// ---------------------------------------------------

renderItems();
