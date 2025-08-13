async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/csrf', { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken;
}

function bindContactForm() {
  const form = document.getElementById('contactForm') as HTMLFormElement | null;
  const nameEl = document.getElementById('name') as HTMLInputElement | null;
  const emailEl = document.getElementById('email') as HTMLInputElement | null;
  const msgEl = document.getElementById('message') as HTMLTextAreaElement | null;
  const outEl = document.getElementById('contactOut') as HTMLDivElement | null;
  if (!form || !nameEl || !emailEl || !msgEl || !outEl) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    outEl.textContent = '';
    try {
      const token = await getCsrfToken();
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'csrf-token': token },
        body: JSON.stringify({ name: nameEl.value, email: emailEl.value, message: msgEl.value }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send');
      }
      outEl.textContent = 'Message sent successfully!';
      form.reset();
    } catch (err: any) {
      outEl.textContent = err.message || 'Failed to send';
    }
  });
}

document.addEventListener('DOMContentLoaded', bindContactForm);

export {};