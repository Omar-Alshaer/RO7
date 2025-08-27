// Offers Page JavaScript

// Cart functionality - ensure consistency with main script
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Reload cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    initializeOffers();
    updateCartCount();
    
    // Initialize theme
    initializeTheme();
});

// Initialize offers functionality
function initializeOffers() {
    initializeCountdownTimers();
    initializeAddToCartButtons();
    initializeNewsletterForm();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize countdown timers
function initializeCountdownTimers() {
    const countdownElements = document.querySelectorAll('.countdown-timer');
    
    countdownElements.forEach(element => {
        const endTime = element.dataset.endTime;
        if (endTime) {
            startCountdown(element, new Date(endTime));
        }
    });
}

// Start countdown timer
function startCountdown(element, endTime) {
    function updateTimer() {
        const now = new Date().getTime();
        const distance = endTime.getTime() - now;
        
        if (distance < 0) {
            element.innerHTML = '<span class="expired">Offer Expired</span>';
            element.closest('.offer-card').classList.add('expired');
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        element.innerHTML = `
            <div class="timer-item">
                <span class="timer-number">${days}</span>
                <span class="timer-label">Days</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${hours}</span>
                <span class="timer-label">Hours</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${minutes}</span>
                <span class="timer-label">Minutes</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${seconds}</span>
                <span class="timer-label">Seconds</span>
            </div>
        `;
        
        // Add urgency warning for last 24 hours
        if (distance < 24 * 60 * 60 * 1000) {
            element.classList.add('urgency-warning');
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Initialize add to cart buttons
function initializeAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart function
function addToCart(event) {
    const button = event.target;
    const productId = button.dataset.id;
    const productName = button.dataset.name;
    const productPrice = parseInt(button.dataset.price);
    
    // Reload cart from localStorage to ensure consistency
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showSuccessMessage(`${productName} added to cart!`);
    
    // Animate button
    animateAddToCartButton(button);
}

// Animate add to cart button
function animateAddToCartButton(button) {
    const originalText = button.textContent;
    
    // Change button text temporarily
    button.textContent = 'Added! ✓';
    button.style.background = 'var(--gold)';
    button.style.transform = 'scale(0.95)';
    
    // Reset after animation
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.style.transform = 'scale(1)';
    }, 1500);
}

// Show success message
function showSuccessMessage(message) {
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
        box-shadow: 0 5px 20px rgba(181, 51, 36, 0.3);
        font-weight: 700;
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
}

// Initialize newsletter form
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Handle newsletter form submission
function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (email) {
        // Show success message
        showSuccessMessage('Thank you for subscribing!');
        
        // Reset form
        form.reset();
    }
}

// Update cart count
function updateCartCount() {
    // Use global cart variable for consistency
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Add animation if count changed
        if (cartCount > 0) {
            cartCountElement.style.animation = 'none';
            setTimeout(() => {
                cartCountElement.style.animation = 'pulse 0.5s ease-out';
            }, 10);
        }
    }
}

// Add CSS animations for offers interactions
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .expired-offer {
        background: #ff6b6b;
        color: white;
        padding: 1rem 2rem;
        border-radius: 15px;
        font-weight: 700;
        font-size: 1.2rem;
        text-align: center;
        animation: pulse 2s infinite;
    }
    
    .urgency-warning {
        animation: pulse 1s infinite;
    }
    
    .offer-card {
        animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .timer-item {
        animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    .offer-badge {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

document.head.appendChild(style);

// Enhanced offer management
function createOfferData() {
    return {
        offers: [
            {
                id: 1,
                name: 'Professional Brush Set',
                originalPrice: 200,
                salePrice: 150,
                discount: 25,
                type: 'Limited Time',
                stock: 5,
                image: 'brush-set',
                category: 'brushes'
            },
            {
                id: 2,
                name: 'Canvas Bundle Pack',
                originalPrice: 400,
                salePrice: 260,
                discount: 35,
                type: 'Bundle Deal',
                stock: 10,
                image: 'canvas-bundle',
                category: 'canvas'
            },
            {
                id: 3,
                name: 'Acrylic Paint Collection',
                originalPrice: 300,
                salePrice: 210,
                discount: 30,
                type: 'Flash Sale',
                stock: 15,
                image: 'paint-set',
                category: 'paints'
            },
            {
                id: 4,
                name: 'Complete Art Starter Kit',
                originalPrice: 500,
                salePrice: 400,
                discount: 20,
                type: 'New Artist',
                stock: 8,
                image: 'art-kit',
                category: 'kits'
            },
            {
                id: 5,
                name: 'Premium Watercolor Set',
                originalPrice: 250,
                salePrice: 150,
                discount: 40,
                type: 'Clearance',
                stock: 3,
                image: 'watercolor-set',
                category: 'paints'
            },
            {
                id: 6,
                name: 'Sketching Essentials',
                originalPrice: 120,
                salePrice: 102,
                discount: 15,
                type: 'Student',
                stock: 20,
                image: 'sketch-set',
                category: 'tools'
            }
        ],
        featuredOffer: {
            title: 'Summer Art Collection',
            description: 'Get up to 40% off on selected art supplies',
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            badge: '🔥 HOT DEAL'
        }
    };
}

// Initialize offer data
const offerData = createOfferData();
localStorage.setItem('offerData', JSON.stringify(offerData));

// Dynamic offer loading (optional enhancement)
function loadOffersDynamically() {
    const offersContainer = document.querySelector('.offers-container');
    if (!offersContainer) return;
    
    const offers = offerData.offers;
    
    offersContainer.innerHTML = '';
    
    offers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        offersContainer.appendChild(offerCard);
    });
}

// Create offer card dynamically (optional enhancement)
function createOfferCard(offer) {
    const offerCard = document.createElement('div');
    offerCard.className = 'offer-card';
    
    offerCard.innerHTML = `
        <div class="offer-image">
            <img src="https://via.placeholder.com/300x200/DFBC94/B53324?text=${offer.image.replace('-', '+')}" alt="${offer.name}">
            <div class="discount-badge">-${offer.discount}%</div>
        </div>
        <div class="offer-content">
            <h3>${offer.name}</h3>
            <p>Premium quality art supplies with amazing discount</p>
            <div class="price-info">
                <span class="original-price">EGP ${offer.originalPrice}</span>
                <span class="sale-price">EGP ${offer.salePrice}</span>
            </div>
            <div class="offer-details">
                <span class="offer-type">${offer.type}</span>
                <span class="stock-status">${offer.stock > 5 ? 'In Stock' : `Only ${offer.stock} left!`}</span>
            </div>
            <button class="btn btn-primary add-to-cart" data-id="${offer.id}" data-name="${offer.name}" data-price="${offer.salePrice}">Add to Cart</button>
        </div>
    `;
    
    return offerCard;
}

// Initialize dynamic loading (optional)
// loadOffersDynamically();

// Offer expiration handling
function checkOfferExpiration() {
    const endDate = parseInt(localStorage.getItem('offerEndDate'));
    if (endDate && Date.now() > endDate) {
        // Offer has expired
        const expiredOffers = document.querySelectorAll('.offer-card');
        expiredOffers.forEach(offer => {
            offer.style.opacity = '0.6';
            offer.style.pointerEvents = 'none';
            
            const addToCartBtn = offer.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.textContent = 'Offer Expired';
                addToCartBtn.disabled = true;
                addToCartBtn.style.background = '#ccc';
            }
        });
        
        // Show expired banner
        const offerBanner = document.querySelector('.offer-banner');
        if (offerBanner) {
            offerBanner.style.opacity = '0.6';
            const shopNowBtn = offerBanner.querySelector('.btn');
            if (shopNowBtn) {
                shopNowBtn.textContent = 'Offers Ended';
                shopNowBtn.disabled = true;
                shopNowBtn.style.background = '#ccc';
            }
        }
    }
}

// Check expiration on page load
checkOfferExpiration();

// Auto-refresh offers (optional enhancement)
function autoRefreshOffers() {
    // Refresh offers every 5 minutes
    setInterval(() => {
        checkOfferExpiration();
        updateCountdown();
    }, 5 * 60 * 1000);
}

// Initialize auto-refresh (optional)
// autoRefreshOffers();

// Theme management functions
function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
}

function toggleTheme() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        themeToggle.setAttribute('data-theme', currentTheme);
    }
}
