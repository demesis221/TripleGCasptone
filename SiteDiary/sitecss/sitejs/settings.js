document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Settings menu navigation
    const menuItems = document.querySelectorAll('.settings-menu-item');
    const settingsSections = document.querySelectorAll('.settings-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            settingsSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Password strength meter
    const passwordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('passwordStrength');
    
    if(passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if(password.length >= 8) strength += 20;
            if(password.match(/[a-z]+/)) strength += 20;
            if(password.match(/[A-Z]+/)) strength += 20;
            if(password.match(/[0-9]+/)) strength += 20;
            if(password.match(/[^a-zA-Z0-9]+/)) strength += 20;
            
            strengthBar.style.width = strength + '%';
            
            if(strength < 40) {
                strengthBar.style.backgroundColor = '#f44336';
            } else if(strength < 70) {
                strengthBar.style.backgroundColor = '#ff9800';
            } else {
                strengthBar.style.backgroundColor = '#4caf50';
            }
        });
    }
    
               // Profile image upload
               const avatarUpload = document.getElementById('avatar-upload');
    const profileImage = document.getElementById('profileImage');
    
    if(avatarUpload && profileImage) {
        avatarUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Success message handling
    const saveButtons = document.querySelectorAll('.btn-primary');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the parent section
            const section = this.closest('.settings-section');
            // Find the success message in this section
            const successMessage = section.querySelector('.success-message');
            
            if(successMessage) {
                // Show success message
                successMessage.style.display = 'flex';
                
                // Hide after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        });
    });
    
    // Two-factor authentication toggle
    const twoFactorToggle = document.getElementById('twoFactorToggle');
    
    if(twoFactorToggle) {
        twoFactorToggle.addEventListener('change', function() {
            if(this.checked) {
                // Simulate 2FA setup - in a real app, this would open a modal or redirect
                alert('Two-factor authentication setup would be initiated here.');
            }
        });
    }
    
    // Set the first menu item as active by default
    if(menuItems.length > 0) {
        menuItems[0].click();
    }
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


// ===== SMOOTH SCROLLING CORE IMPLEMENTATION =====
let isScrolling = false;
let lastScrollTime = 0;
const SCROLL_THROTTLE_TIME = 100;

// Unified easing function
function easeInOutCubic(t) {
return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function smoothScrollTo(targetPosition, duration = 10000) {
if (isScrolling) return;
isScrolling = true;

const startPosition = window.pageYOffset;
const distance = targetPosition - startPosition;
const startTime = performance.now();

function animate(currentTime) {
const elapsed = currentTime - startTime;
const progress = Math.min(elapsed / duration, 1);
const easedProgress = easeInOutCubic(progress);

window.scrollTo(0, startPosition + distance * easedProgress);

if (progress < 1) {
    requestAnimationFrame(animate);
} else {
    isScrolling = false;
}
}

requestAnimationFrame(animate);
}

// ===== EVENT HANDLERS =====
function handleWheel(e) {
if (Date.now() - lastScrollTime < SCROLL_THROTTLE_TIME) return;
lastScrollTime = Date.now();

if (Math.abs(e.deltaY) < 20) return;

e.preventDefault();

const direction = Math.sign(e.deltaY);
const pageHeight = window.innerHeight;
const targetPosition = Math.max(0, 
Math.min(document.documentElement.scrollHeight - pageHeight,
window.pageYOffset + (direction * pageHeight))
);

smoothScrollTo(targetPosition, 800);
}

function handleKeyboard(e) {
let targetPosition;
const currentPosition = window.pageYOffset;
const pageHeight = window.innerHeight;
const docHeight = document.documentElement.scrollHeight;

switch(e.key) {
case 'ArrowDown':
    targetPosition = currentPosition + pageHeight * 0.25;
    break;
case 'ArrowUp':
    targetPosition = currentPosition - pageHeight * 0.25;
    break;
case 'PageDown':
    targetPosition = currentPosition + pageHeight * 0.9;
    break;
case 'PageUp':
    targetPosition = currentPosition - pageHeight * 0.9;
    break;
case 'Home':
    targetPosition = 0;
    break;
case 'End':
    targetPosition = docHeight - pageHeight;
    break;
default:
    return;
}

e.preventDefault();
targetPosition = Math.max(0, Math.min(docHeight - pageHeight, targetPosition));
smoothScrollTo(targetPosition, 700);
}

// ===== ANCHOR LINK HANDLING =====
function handleAnchorClick(e) {
e.preventDefault();
const targetId = this.hash;
if (!targetId || targetId === '#') return;

const targetElement = document.querySelector(targetId);
if (!targetElement) return;

const navbar = document.querySelector('.navbar');
const navbarHeight = navbar ? navbar.offsetHeight : 0;
const targetPosition = targetElement.getBoundingClientRect().top + 
                 window.pageYOffset - 
                 (navbarHeight + 20); // 20px buffer

smoothScrollTo(targetPosition, 1000);

// Update URL without jumping
history.replaceState(null, null, targetId);
}

// ===== INITIALIZATION =====
function initSmoothScroll() {
// Event Listeners
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('keydown', handleKeyboard);
window.addEventListener('scrollend', () => isScrolling = false);

// Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', handleAnchorClick);
});

// Mobile Menu Integration
const mobileMenu = document.getElementById('navLinks');
if (mobileMenu) {
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && 
        !e.target.closest('.navbar')) {
        mobileMenu.classList.remove('active');
    }
});
}
}

document.addEventListener("DOMContentLoaded", initSmoothScroll);
    
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
});
