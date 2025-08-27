document.addEventListener("DOMContentLoaded", function () {
    // Load global header
    loadGlobalHeader();
    
    const recentProjects = document.getElementById("recentProjects");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const homeSection = document.getElementById("homeSection");
    const mainImage = document.getElementById("mainImage");
    const images = [...recentProjects.getElementsByTagName("img")];
  
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
  
    // Function to load global header (inline method to avoid CORS)
    function loadGlobalHeader() {
      const headerHTML = `
        <!-- Navigation -->
        <nav class="navbar">
          <div class="logo-container">
            <img class="logo" src="css/images/logostick.png" alt="Logo">
            <div class="logo1">TRIPLE<a>G.</a></div>
          </div>
          <ul class="nav-links" id="navLinks">
            <li><a href="home.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="bloglist.html">Blog</a></li>
            <li><a href="contacts.html">Contact</a></li>
            <li><a href="aboutus.html">About Us</a></li>
            <li><a href="../SiteDiary/dashboard.html">ArchitectDiary</a></li>
            <li><a href="usersettings.html" class="active">Settings</a></li>
            <li><a href="index.html">Log in</a></li>
          </ul>
          <button class="mobile-menu-btn" id="mobileMenuBtn">
            <i class="fas fa-bars"></i>
          </button>
        </nav>
      `;
      document.getElementById('header-placeholder').innerHTML = headerHTML;
    }
  
  
    let scrollAmount = 0; // Track current scroll position
    const imgWidth = images.length > 0 ? images[0].clientWidth + 10 : 160; // Account for gap
    const maxScroll = recentProjects.scrollWidth - recentProjects.clientWidth; // Max scroll limit
  
    // Function for ultra-smooth scrolling
    function smoothScroll(direction) {
      let start = recentProjects.scrollLeft;
      let end = direction === "prev" ? start - imgWidth : start + imgWidth;
  
      // Prevent over-scrolling
      end = Math.max(0, Math.min(end, maxScroll));
  
      let startTime = null;
  
      function scrollAnimation(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let ease = Math.min(progress / 300, 1); // 300ms smooth transition
  
        recentProjects.scrollLeft = start + (end - start) * ease;
  
        if (ease < 1) {
          requestAnimationFrame(scrollAnimation);
        }
      }
  
      requestAnimationFrame(scrollAnimation);
    }
  
    // Previous Button: Smooth Scroll Left
    prevBtn.addEventListener("click", () => {
      smoothScroll("prev");
    });
  
    // Next Button: Smooth Scroll Right
    nextBtn.addEventListener("click", () => {
      smoothScroll("next");
    });
  
    // Function to change main image and background
    window.changeMainImage = function (imageSrc) {
      let imagePath = imageSrc.includes("css/images") ? imageSrc : "./css/images/" + imageSrc;
  
      mainImage.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      mainImage.style.opacity = "0";
      mainImage.style.transform = "scale(1.1)"; // Slight zoom effect
  
      setTimeout(() => {
        mainImage.src = imagePath;
        mainImage.style.opacity = "1";
        mainImage.style.transform = "scale(1)"; // Reset scale
      }, 300);
  
      homeSection.style.backgroundImage = `url('${imagePath}')`;
    };
  
    // Clicking an image updates the main image
    images.forEach((img) => {
      img.addEventListener("click", function () {
        changeMainImage(this.src);
      });
    });
  
    // Button hover effect
    let btns = document.querySelectorAll("a[data-color]");
    btns.forEach((btn) => {
      btn.onmousemove = function (e) {
        let x = e.pageX - btn.offsetLeft;
        let y = e.pageY - btn.offsetTop;
  
        btn.style.setProperty("--x", x + "px");
        btn.style.setProperty("--y", y + "px");
        btn.style.setProperty("--clr", btn.getAttribute("data-color"));
      };
    });
  
    // Handle window resize
    window.addEventListener('resize', function() {
      // Update dimensions when window is resized
      if (images.length > 0) {
        const newImgWidth = images[0].clientWidth + 10;
        // Update max scroll limit
        const newMaxScroll = recentProjects.scrollWidth - recentProjects.clientWidth;
      }
    });
  
    // Add smooth scrolling behavior for vertical page scrolling
    // Current scroll position
    let currentScroll = window.pageYOffset;
    // Target scroll position
    let targetScroll = currentScroll;
    // Flag to track if animation is running
    let ticking = false;
    
    // Smooth scroll animation function
    function smoothPageScroll() {
      // Calculate distance between current and target
      const diff = targetScroll - currentScroll;
      // If difference is very small, snap to target
      if (Math.abs(diff) < 0.5) {
        currentScroll = targetScroll;
        window.scrollTo(0, currentScroll);
        ticking = false;
        return;
      }
      
      // Calculate step with easing
      currentScroll += diff * 0.1;
      
      // Update scroll position
      window.scrollTo(0, currentScroll);
      
      // Continue animation
      if (currentScroll !== targetScroll) {
        requestAnimationFrame(smoothPageScroll);
      } else {
        ticking = false;
      }
    }
    
    // Handle wheel event
    function handleWheel(e) {
      e.preventDefault();
      
      // Update target scroll position
      targetScroll = Math.max(0,
        Math.min(
          document.body.scrollHeight - window.innerHeight,
          targetScroll + e.deltaY
        )
      );
      
      // Start animation if not already running
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(smoothPageScroll);
      }
    }
    
    // Add event listener for wheel event
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Handle keyboard navigation
    window.addEventListener('keydown', function(e) {
      let scrollAmount = 0;
      
      // Arrow keys, Page Up/Down, Home/End
      switch(e.key) {
        case 'ArrowDown':
          scrollAmount = 40;
          break;
        case 'ArrowUp':
          scrollAmount = -40;
          break;
        case 'PageDown':
          scrollAmount = window.innerHeight * 0.9;
          break;
        case 'PageUp':
          scrollAmount = -window.innerHeight * 0.9;
          break;
        case 'Home':
          targetScroll = 0;
          break;
        case 'End':
          targetScroll = document.body.scrollHeight - window.innerHeight;
          break;
        default:
          return; // Exit for other keys
      }
      
      if (scrollAmount !== 0) {
        e.preventDefault();
        // Update target scroll position
        targetScroll = Math.max(0,
          Math.min(
            document.body.scrollHeight - window.innerHeight,
            targetScroll + scrollAmount
          )
        );
      }
      
      // Start animation if not already running
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(smoothPageScroll);
      }
    });
  });
  