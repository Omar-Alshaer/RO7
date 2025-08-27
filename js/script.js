// Main JavaScript file for Ro7 Art Hub

// Theme functionality
let currentTheme = localStorage.getItem('theme') || 'light';

// Loading screen functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    // Initialize cart system
    if (window.cartManager) {
        window.cartManager.initializeCart();
    }
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
        }, 500);
    }, 2000);
    
    // Show newsletter popup after loading screen disappears
    setTimeout(() => {
        showNewsletterPopup();
    }, 2500);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize theme
    initializeTheme();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Prevent product card links from triggering when clicking buttons
    document.querySelectorAll('.product-card-link').forEach(link => {
        const button = link.querySelector('.add-to-cart');
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    });
    
    // Newsletter popup
    const newsletterClose = document.getElementById('newsletter-close');
    if (newsletterClose) {
        newsletterClose.addEventListener('click', function() {
            hideNewsletterPopup();
            // Show popup again after 5M
            setTimeout(() => {
                showNewsletterPopup();
            }, 5 * 60 * 1000);
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Footer newsletter form
    const footerNewsletterForm = document.getElementById('footer-newsletter-form');
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', handleFooterNewsletterSubmit);
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Cart functions
function addToCart(event) {
    const button = event.target;
    const productId = button.dataset.id;
    const productName = button.dataset.name;
    const productPrice = parseInt(button.dataset.price);
    
    if (!productId || !productName || !productPrice) {
        return;
    }
    
    const productData = {
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1
    };
    
    if (window.cartManager && window.cartManager.addProductToCart(productData)) {
        // Show success message
        showSuccessMessage('Product added to cart!');
        
        // Animate button
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
}

// Show success message
function showSuccessMessage(message) {
    // Create success message element
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 300);
    }, 3000);
}

// Newsletter popup functions
function showNewsletterPopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
        popup.classList.remove('hidden');
    }
}

function hideNewsletterPopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (email) {
        // Show success message
        showSuccessMessage('Thank you for subscribing!');
        hideNewsletterPopup();
        
        // Reset form
        form.reset();
        
        // Show popup again after 2 seconds for new visitors
        setTimeout(() => {
            showNewsletterPopup();
        }, 2000);
    }
}

// Footer newsletter functions
function handleFooterNewsletterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[name="email"]').value;
    const submitBtn = form.querySelector('.newsletter-submit-btn');
    const messageDiv = document.getElementById('newsletter-message');
    
    // Validate email
    if (!isValidEmail(email)) {
        showNewsletterMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Subscribing...</span><span class="btn-icon">⏳</span>';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Success
        showNewsletterMessage('🎉 Thank you for subscribing! You\'ll receive our latest updates soon.', 'success');
        form.reset();
        
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            hideNewsletterMessage();
        }, 5000);
    }, 1500);
}

function showNewsletterMessage(message, type) {
    const messageDiv = document.getElementById('newsletter-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `newsletter-message ${type}`;
        messageDiv.style.display = 'block';
    }
}

function hideNewsletterMessage() {
    const messageDiv = document.getElementById('newsletter-message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
        messageDiv.className = 'newsletter-message';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Theme management functions
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('data-theme', currentTheme);
    }
}

// Page Transition Animation
function initPageTransitions() {
    // Create transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition';
    
    // Create loading content similar to original loading screen
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';
    
    const logoText = document.createElement('div');
    logoText.className = 'logo-text';
    logoText.textContent = 'Ro7';
    
    const loadingSubtitle = document.createElement('div');
    loadingSubtitle.className = 'loading-subtitle';
    loadingSubtitle.textContent = 'Art Hub';
    
    const artisticProgress = document.createElement('div');
    artisticProgress.className = 'artistic-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    artisticProgress.appendChild(progressBar);
    loadingContent.appendChild(logoText);
    loadingContent.appendChild(loadingSubtitle);
    loadingContent.appendChild(artisticProgress);
    transitionOverlay.appendChild(loadingContent);
    
    document.body.appendChild(transitionOverlay);

    // Add page-content class to main content
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    if (mainContent) {
        mainContent.classList.add('page-content');
    }

    // Handle all internal links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && link.href.includes(window.location.origin) && !link.href.includes('#') && !link.href.includes('javascript:')) {
            e.preventDefault();
            
            // Show transition
            transitionOverlay.classList.add('active');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = link.href;
            }, 800);
        }
    });

    // Handle form submissions
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.action && form.action.includes(window.location.origin)) {
            // Show transition for form submissions
            transitionOverlay.classList.add('active');
        }
    });

    // Handle browser back/forward
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            // Page loaded from cache, hide transition
            transitionOverlay.classList.remove('active');
        }
    });

    // Hide transition when page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            transitionOverlay.classList.remove('active');
        }, 100);
    });

    // Hide transition on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                transitionOverlay.classList.remove('active');
            }, 100);
        });
    } else {
        setTimeout(() => {
            transitionOverlay.classList.remove('active');
        }, 100);
    }
}

// Initialize page transitions
initPageTransitions();
