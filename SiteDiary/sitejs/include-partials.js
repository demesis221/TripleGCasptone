// Dynamically include HTML partials into elements with data-include attribute
(async function includePartials() {
  const nodes = document.querySelectorAll('[data-include]');
  for (const node of nodes) {
    const url = node.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      node.innerHTML = await res.text();
    } catch (e) {
      console.error(e);
    }
  }
  // Wire up mobile menu after injection
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
})();
