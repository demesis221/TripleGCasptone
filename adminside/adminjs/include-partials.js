// Admin include-partials.js
// Dynamically injects partial HTML and wires up dropdowns and mobile menu

async function includePartials() {
  const includes = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(includes).map(async (el) => {
      const src = el.getAttribute('data-include');
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
        el.outerHTML = await res.text();
      } catch (err) {
        console.error('Include error:', err);
      }
    })
  );
}

function initAdminNav() {
  // Dropdowns
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const dropdown = this.parentElement;
      document.querySelectorAll('.dropdown').forEach((item) => {
        if (item !== dropdown && item.classList.contains('active')) {
          item.classList.remove('active');
        }
      });
      dropdown.classList.toggle('active');
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach((dropdown) => {
        dropdown.classList.remove('active');
      });
    }
  });

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage) {
    const menuLinks = document.querySelectorAll('.nav-links a');
    menuLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.includes(currentPage)) {
        link.classList.add('active');
        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const dt = parentDropdown.querySelector('.dropdown-toggle');
          if (dt) dt.classList.add('active');
        }
      }
    });
  }

  // Mobile menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
    });
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await includePartials();
  initAdminNav();
});
