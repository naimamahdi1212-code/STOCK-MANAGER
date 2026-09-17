/* ===================================================
   Duka Stock — Shop Inventory
   login.js
   =================================================== */

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// Already signed in? Skip straight to the app.
(async function redirectIfSignedIn() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) window.location.href = 'index.html';
})();

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in…';

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });

  if (error) {
    loginError.textContent = error.message === 'Invalid login credentials'
      ? 'Incorrect email or password.'
      : error.message;
    loginError.hidden = false;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log in';
    return;
  }

  window.location.href = 'index.html';
});
