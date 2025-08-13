// frontend/contact.ts
async function getCsrfToken() {
  const res = await fetch("/api/csrf", { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}
function bindContactForm() {
  const form = document.getElementById("contactForm");
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const msgEl = document.getElementById("message");
  const outEl = document.getElementById("contactOut");
  if (!form || !nameEl || !emailEl || !msgEl || !outEl) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    outEl.textContent = "";
    try {
      const token = await getCsrfToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "csrf-token": token },
        body: JSON.stringify({ name: nameEl.value, email: emailEl.value, message: msgEl.value }),
        credentials: "include"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send");
      }
      outEl.textContent = "Message sent successfully!";
      form.reset();
    } catch (err) {
      outEl.textContent = err.message || "Failed to send";
    }
  });
}
document.addEventListener("DOMContentLoaded", bindContactForm);
//# sourceMappingURL=contact.js.map
