document.addEventListener('DOMContentLoaded', function() {
  // Apply hover effects to form submit buttons
  const formButtons = document.querySelectorAll('.contact-form .form-actions button[type="submit"]');
  
  formButtons.forEach(button => {
    button.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.style.setProperty('--x', `${x}px`);
      this.style.setProperty('--y', `${y}px`);
    });
    
    // Wrap text in span if not already
    if (!button.querySelector('span')) {
      const text = button.textContent;
      button.innerHTML = `<span>${text}</span>`;
    }
  });
}); 

document.addEventListener("DOMContentLoaded", function() {
  // Apply custom scrollbar styles
  const style = document.createElement('style');
  style.textContent = `
    /* Webkit browsers (Chrome, Safari, newer versions of Opera) */
    ::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }
    
    ::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0);
      border-radius: 5px;
      border: 2px solid transparent;
      background-clip: content-box;
      transition: background-color 0.3s;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0);
    }
    
    /* For Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }
    
    /* Hide scrollbar when not scrolling (optional) */
    body:not(:hover)::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0);
    }
  `;
  document.head.appendChild(style);
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = targetPosition + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('.reveal');
  
  function checkReveal() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add('active');
      }
    });
  }
  
  // Check on initial load
  checkReveal();
  
  // Check on scroll
  window.addEventListener('scroll', checkReveal);
  
  // Sticky navbar - with null check
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const sticky = navbar.offsetTop;
    
    function stickyNavbar() {
      if (window.pageYOffset > sticky) {
        navbar.classList.add('sticky-navbar');
      } else {
        navbar.classList.remove('sticky-navbar');
      }
    }
    
    window.addEventListener('scroll', stickyNavbar);
  }
  
  // FAQ Toggle - Wait for global header to load first
  setTimeout(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
          question.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other items
            faqItems.forEach(otherItem => {
              if (otherItem !== item) {
                otherItem.classList.remove('active');
              }
            });
            
            // Toggle current item
            item.classList.toggle('active');
          });
        }
      });
      
      console.log(`FAQ initialized with ${faqItems.length} items`);
    } else {
      console.log('No FAQ items found');
    }
  }, 1000);
  
  // Form Validation and Submission
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic validation
    let isValid = true;
    const requiredFields = contactForm.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = '#F44336';
      } else {
        field.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailField.value && !emailPattern.test(emailField.value)) {
      isValid = false;
      emailField.style.borderColor = '#F44336';
    }
    
    // Form submission
    if (isValid) {
      // Normally, you would send data to a server here
      // For demo purposes, we'll just show a success message
      formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
      formStatus.className = 'form-status success-message';
      formStatus.style.display = 'block';
      
      // Reset form
      contactForm.reset();
      
      // Hide message after 5 seconds
      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 5000);
    } else {
      formStatus.textContent = 'Please fill in all required fields correctly.';
      formStatus.className = 'form-status error-message';
      formStatus.style.display = 'block';
    }
    });
  }
  
  // Button hover effect
  let btns = document.querySelectorAll("a[data-color], button[data-color]");
  btns.forEach((btn) => {
    btn.onmousemove = function(e) {
      let x = e.pageX - btn.offsetLeft;
      let y = e.pageY - btn.offsetTop;
      
      btn.style.setProperty("--x", x + "px");
      btn.style.setProperty("--y", y + "px");
      btn.style.setProperty("--clr", btn.getAttribute("data-color"));
    };
  });
});