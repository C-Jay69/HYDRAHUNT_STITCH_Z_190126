// Lightweight helper that wires newsletter inputs and basic forms to the backend
(function () {
  async function postJSON(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Wire newsletter email inputs (footer pattern)
  function wireNewsletter() {
    const footers = Array.from(document.querySelectorAll('footer'));
    footers.forEach((footer) => {
      const input = footer.querySelector('input[type="email"]');
      const button = footer.querySelector('button');
      if (input && button) {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          const email = input.value && input.value.trim();
          if (!email) return alert('Please enter an email');
          try {
            const r = await postJSON('/api/newsletter', { email });
            if (r && r.ok) {
              input.value = '';
              alert('Thanks — subscribed!');
            } else {
              alert('Subscribe failed');
            }
          } catch (err) {
            console.error(err);
            alert('Network error');
          }
        });
      }
    });
  }

  // Wire generic forms that include file inputs to /api/upload-resume (best-effort)
  function wireFileForms() {
    const forms = Array.from(document.querySelectorAll('form'));
    forms.forEach((form) => {
      const fileInput = form.querySelector('input[type="file"]');
      if (!fileInput) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        try {
          const res = await fetch('/api/upload-resume', { method: 'POST', body: fd });
          const j = await res.json();
          if (j && j.ok) alert('File uploaded'); else alert('Upload failed');
        } catch (err) {
          console.error(err);
          alert('Upload error');
        }
      });
    });
  }

  // Apply when DOM ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    wireNewsletter();
    wireFileForms();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      wireNewsletter();
      wireFileForms();
    });
  }
})();
