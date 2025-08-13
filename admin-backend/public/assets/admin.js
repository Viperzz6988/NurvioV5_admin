// frontend/admin.ts
async function getCsrfToken() {
  const res = await fetch("/api/csrf", { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}
async function loginAdmin(email, password) {
  const token = await getCsrfToken();
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "csrf-token": token },
    body: JSON.stringify({ email, password }),
    credentials: "include"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}
async function logoutAdmin() {
  const token = await getCsrfToken();
  await fetch("/api/admin/logout", { method: "POST", headers: { "csrf-token": token }, credentials: "include" });
  location.reload();
}
function bindLoginForm() {
  const form = document.getElementById("loginForm");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const errEl = document.getElementById("loginError");
  if (!form || !emailEl || !passEl || !errEl) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";
    try {
      await loginAdmin(emailEl.value, passEl.value);
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("adminSection").classList.remove("hidden");
      window.initUserDropdown("userDropdown");
    } catch (err) {
      errEl.textContent = err.message || "Login failed";
    }
  });
}
function bindLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) btn.addEventListener("click", logoutAdmin);
}
document.addEventListener("DOMContentLoaded", () => {
  bindLoginForm();
  bindLogout();
});
//# sourceMappingURL=admin.js.map
