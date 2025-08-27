// Global Header Loader - Reusable across all pages
document.addEventListener("DOMContentLoaded", function () {
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
                <li><a href="usersettings.html">Settings</a></li>
                <li><a href="index.html">Log in</a></li>
              </ul>
              <button class="mobile-menu-btn" id="mobileMenuBtn">
                <i class="fas fa-bars"></i>
              </button>
            </nav>
        `;
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            placeholder.innerHTML = headerHTML;
            
            // Dispatch custom event to notify that header is loaded
            const headerLoadedEvent = new CustomEvent('headerLoaded');
            document.dispatchEvent(headerLoadedEvent);
            console.log('Global header loaded and event dispatched');
        }
    }

    // Load the header
    loadGlobalHeader();
});
