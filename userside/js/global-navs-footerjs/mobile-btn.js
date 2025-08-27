// Mobile menu toggle functionality - Enhanced for dynamic header loading
document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  
  // Also listen for when the global header is loaded
  document.addEventListener('headerLoaded', initializeMobileMenu);
});

function initializeMobileMenu() {
  // Use a small delay to ensure DOM elements are ready
  setTimeout(() => {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");

    // Remove any existing event listeners to prevent duplicates
    if (mobileMenuBtn && mobileMenuBtn._mobileMenuInitialized) {
      return;
    }

    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
      console.log('Initializing mobile menu functionality');
      
      mobileMenuBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        navLinks.classList.toggle("active");
        const icon = this.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-bars");
          icon.classList.toggle("fa-times");
        }
      });

      // Close mobile menu when clicking outside
      document.addEventListener("click", function (event) {
        if (!event.target.closest(".navbar") && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          const icon = mobileMenuBtn.querySelector("i");
          if (icon) {
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-times");
          }
        }
      });

      // Mark as initialized to prevent duplicate listeners
      mobileMenuBtn._mobileMenuInitialized = true;
    } else {
      console.warn('Mobile menu elements not found:', {
        mobileMenuBtn: !!mobileMenuBtn,
        navLinks: !!navLinks
      });
    }
  }, 100);
}
