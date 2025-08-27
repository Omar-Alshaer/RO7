// Cart Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page loaded');
    
    // Wait for cart-common.js to be fully loaded
    setTimeout(() => {
        if (window.cartManager && window.wishlistManager) {
            // Initialize cart
            window.cartManager.init();
            
            // Initialize wishlist
            window.wishlistManager.init();
            
            // Load cart and add event listeners
            loadCartFromStorage();
            addEventListeners();
            setupRealTimeUpdates();
            
            console.log('Cart and Wishlist initialized successfully');
        } else {
            console.error('Cart or Wishlist manager not found');
        }
    }, 100);
});

function loadCartFromStorage() {
    console.log('Loading cart from storage...');
    
    if (window.cartManager) {
        console.log('Cart manager available, loading cart...');
        window.cartManager.loadCartFromStorage();
        const cart = window.cartManager.cart;
        console.log('Cart loaded from manager:', cart);
        
        if (cart.length === 0) {
            console.log('Cart is empty, showing empty cart message');
            showEmptyCart();
        } else {
            console.log('Cart has items, displaying cart items');
            displayCartItems(cart);
        }
        
        window.cartManager.updateCartCount();
    } else {
        console.error('Cart manager not available, loading from localStorage directly');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Cart loaded from localStorage:', cart);
        
        if (cart.length === 0) {
            showEmptyCart();
        } else {
            displayCartItems(cart);
        }
        
        updateCartCount();
    }
}

function displayCartItems(cart) {
    console.log('Displaying cart items:', cart);
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }
    
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Hide empty cart message
    if (emptyCart) {
        emptyCart.classList.add('hidden');
    }
    
    // Enable checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    // Add loading state
    cartItemsContainer.classList.add('loading');
    
    // Create cart items
    cart.forEach((item, index) => {
        const cartItem = createCartItemElement(item, index);
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Remove loading state
    setTimeout(() => {
        cartItemsContainer.classList.remove('loading');
    }, 500);
}

function createCartItemElement(item, index) {
    console.log('Creating cart item element for:', item, 'at index:', index);
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.itemId = item.id;
    cartItem.dataset.index = index;
    
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" loading="lazy">
        </div>
        
        <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="item-category">${item.category || 'Art Supply'}</div>
            <div class="cart-item-price">$${item.price}</div>
        </div>
        
        <div class="cart-item-quantity">
            <button class="quantity-btn minus-btn" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn plus-btn">+</button>
        </div>
        
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        
        <button class="remove-item-btn" title="Remove item">🗑️</button>
    `;
    
    // Add event listeners for buttons
    const minusBtn = cartItem.querySelector('.minus-btn');
    const plusBtn = cartItem.querySelector('.plus-btn');
    const removeBtn = cartItem.querySelector('.remove-item-btn');
    
    if (minusBtn) {
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentIndex = parseInt(cartItem.dataset.index, 10);
            console.log('Minus button clicked for index:', currentIndex);
            updateQuantity(currentIndex, -1);
        });
        console.log('Minus button event listener added for index:', index);
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentIndex = parseInt(cartItem.dataset.index, 10);
            console.log('Plus button clicked for index:', currentIndex);
            updateQuantity(currentIndex, 1);
        });
        console.log('Plus button event listener added for index:', index);
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentIndex = parseInt(cartItem.dataset.index, 10);
            console.log('Remove button clicked for index:', currentIndex);
            removeItem(currentIndex);
        });
        console.log('Remove button event listener added for index:', index);
    }
    
    console.log('Cart item element created with event listeners for index:', index);
    return cartItem;
}

function showEmptyCart() {
    console.log('Showing empty cart message');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
    }
    
    if (emptyCart) {
        emptyCart.classList.remove('hidden');
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
    }
}

function updateQuantity(index, change) {
    console.log('Updating quantity for item at index:', index, 'change:', change);
    
    if (window.cartManager) {
        const success = window.cartManager.updateProductQuantity(index, change);
        if (success) {
            // Reload cart display
            loadCartFromStorage();
        } else {
            console.error('Failed to update quantity');
        }
    }
}

function removeItem(index) {
    console.log('Removing item at index:', index);
    
    if (window.cartManager) {
        const success = window.cartManager.removeProductFromCart(index);
        if (success) {
            // Reload cart display
            loadCartFromStorage();
        } else {
            console.error('Failed to remove item');
        }
    }
}

function clearCart() {
    console.log('Clearing cart');
    
    // Create and show confirmation popup
    showClearCartPopup();
}

function showClearCartPopup() {
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.cssText = `
        background: var(--bg-primary);
        border: 2px solid var(--gold);
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    // Create popup HTML
    popupContent.innerHTML = `
        <div class="popup-icon" style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
        <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-family: 'Playfair Display', serif;">Clear Cart?</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
            Are you sure you want to remove all items from your cart? This action cannot be undone.
        </p>
        <div class="popup-buttons" style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-secondary cancel-btn" style="min-width: 100px;">Cancel</button>
            <button class="btn btn-danger confirm-btn" style="min-width: 100px;">Clear Cart</button>
        </div>
    `;
    
    // Add popup to page
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Animate in
    setTimeout(() => {
        popupOverlay.style.opacity = '1';
        popupContent.style.transform = 'scale(1)';
    }, 10);
    
    // Add event listeners
    const cancelBtn = popupContent.querySelector('.cancel-btn');
    const confirmBtn = popupContent.querySelector('.confirm-btn');
    
    cancelBtn.addEventListener('click', () => {
        hidePopup(popupOverlay);
    });
    
    confirmBtn.addEventListener('click', () => {
        if (window.cartManager) {
            window.cartManager.clearCart();
            console.log('Cart cleared successfully');
            hidePopup(popupOverlay);
            loadCartFromStorage();
        } else {
            console.error('Cart manager not available');
        }
    });
    
    // Close on overlay click
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            hidePopup(popupOverlay);
        }
    });
}

function hidePopup(popupOverlay) {
    const popupContent = popupOverlay.querySelector('.popup-content');
    
    // Animate out
    popupOverlay.style.opacity = '0';
    popupContent.style.transform = 'scale(0.8)';
    
    // Remove after animation
    setTimeout(() => {
        if (popupOverlay.parentNode) {
            popupOverlay.parentNode.removeChild(popupOverlay);
        }
    }, 300);
}

function updateCartCount() {
    console.log('Updating cart count');
    
    if (window.cartManager) {
        window.cartManager.updateCartCount();
    } else {
        console.error('Cart manager not available for updating cart count');
    }
}

function addEventListeners() {
    console.log('Adding event listeners');
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function setupRealTimeUpdates() {
    console.log('Setting up real-time updates');
    
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            console.log('Cart storage changed, reloading...');
            loadCartFromStorage();
        }
    });
    
    // Listen for custom cart events
    window.addEventListener('cartUpdated', () => {
        console.log('Cart updated event received');
        loadCartFromStorage();
    });
    
    // Fallback: check for updates every 2 seconds
    setInterval(() => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const displayedCart = document.querySelectorAll('.cart-item');
        
        if (currentCart.length !== displayedCart.length) {
            console.log('Cart count mismatch, reloading...');
            loadCartFromStorage();
        }
    }, 2000);
}

function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = themeToggle.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    themeToggle.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
});
