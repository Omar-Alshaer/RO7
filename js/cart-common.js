// Common Cart Management System
// This file ensures cart consistency across all pages

// Global cart state
let cart = [];
let cartCount = 0;

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        } else {
            cart = [];
        }
        updateCartCount();
        console.log('Cart loaded from storage:', cart);
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart = [];
        cartCount = 0;
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Dispatch custom event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { cart, cartCount } 
        }));
        
        console.log('Cart saved successfully:', { cart, cartCount });
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

// Update cart count in all elements
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    console.log('Updating cart count:', cartCount);
    
    // Update all cart count elements in the page
    const cartCountElements = document.querySelectorAll('.cart-count, .cart-count-badge, [data-cart-count]');
    console.log('Found cart count elements:', cartCountElements.length);
    
    if (cartCountElements.length === 0) {
        console.warn('No cart count elements found on this page');
        return;
    }
    
    cartCountElements.forEach((cartCountElement, index) => {
        cartCountElement.textContent = cartCount;
        console.log(`Updated cart count element ${index}:`, cartCountElement.textContent);
        
        // Add animation if count changed
        if (cartCount > 0) {
            cartCountElement.style.animation = 'none';
            setTimeout(() => {
                cartCountElement.style.animation = 'bounceIn 0.6s ease-out';
            }, 10);
        }
    });
}

// Add product to cart
function addProductToCart(productData) {
    console.log('Adding product to cart:', productData);
    
    // Validate product data
    if (!productData) {
        console.error('No product data provided');
        return false;
    }
    
    if (!productData.id || !productData.name || !productData.price || !productData.quantity) {
        console.error('Missing required product data:', {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            quantity: productData.quantity
        });
        return false;
    }
    
    // Ensure price and quantity are numbers
    const price = parseInt(productData.price);
    const quantity = parseInt(productData.quantity);
    
    if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        console.error('Invalid price or quantity:', { price, quantity });
        return false;
    }
    
    // Create normalized product data
    const normalizedProduct = {
        id: productData.id.toString(),
        name: productData.name.toString(),
        price: price,
        quantity: quantity,
        size: null, // No size selection
        image: productData.image || ''
    };
    
    console.log('Normalized product data:', normalizedProduct);
    
    // Check if product already exists in cart
    const existingIndex = cart.findIndex(item => item.id === normalizedProduct.id);
    
    if (existingIndex !== -1) {
        // Update quantity if product exists
        console.log('Product already exists, updating quantity');
        cart[existingIndex].quantity += normalizedProduct.quantity;
    } else {
        // Add new product
        console.log('Adding new product to cart');
        cart.push(normalizedProduct);
    }
    
    console.log('Cart after adding product:', cart);
    
    saveCartToStorage();
    return true;
}

// Remove product from cart by index
function removeProductFromCart(index) {
    console.log('Removing product at index:', index, 'Cart length:', cart.length);
    console.log('Current cart:', cart);
    
    if (index >= 0 && index < cart.length) {
        const removedItem = cart[index];
        console.log('Removing item:', removedItem);
        
        cart.splice(index, 1);
        console.log('Cart after removal:', cart);
        
        saveCartToStorage();
        return true;
    } else {
        console.error('Invalid index for removal:', index, 'Cart length:', cart.length);
        console.error('Cart contents:', cart);
        return false;
    }
}

// Update product quantity by index
function updateProductQuantity(index, change) {
    console.log('Updating quantity at index:', index, 'change:', change, 'Cart length:', cart.length);
    console.log('Current cart:', cart);
    
    if (index >= 0 && index < cart.length) {
        const currentQuantity = cart[index].quantity;
        const newQuantity = currentQuantity + change;
        
        console.log('Current quantity:', currentQuantity, 'New quantity:', newQuantity);
        
        if (newQuantity <= 0) {
            console.log('Quantity will be 0 or less, removing item');
            const removedItem = cart[index];
            cart.splice(index, 1);
            console.log('Removed item:', removedItem);
        } else {
            console.log('Updating quantity from', currentQuantity, 'to', newQuantity);
            cart[index].quantity = newQuantity;
        }
        
        console.log('Cart after update:', cart);
        saveCartToStorage();
        return true;
    } else {
        console.error('Invalid index for quantity update:', index, 'Cart length:', cart.length);
        console.error('Cart contents:', cart);
        return false;
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    saveCartToStorage();
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Initialize cart on page load
function initializeCart() {
    console.log('Initializing cart system...');
    loadCartFromStorage();
    
    // Listen for storage changes to update cart in real-time
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            console.log('Storage change detected, reloading cart...');
            loadCartFromStorage();
        }
    });
    
    console.log('Cart system initialized successfully');
}

// Export functions for use in other files
window.cartManager = {
    loadCartFromStorage,
    saveCartToStorage,
    updateCartCount,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    clearCart,
    getCartTotal,
    initializeCart,
    init: initializeCart, // Add missing init function
    get cart() { return cart; },
    get cartCount() { return cartCount; }
};

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
} else {
    initializeCart();
}

// Wishlist Management
window.wishlistManager = {
    // Get wishlist from localStorage
    getWishlist: function() {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    },

    // Save wishlist to localStorage
    saveWishlist: function(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        this.updateWishlistCount();
    },

    // Add product to wishlist
    addToWishlist: function(product) {
        const wishlist = this.getWishlist();
        const existingProduct = wishlist.find(item => item.id === product.id);
        
        if (!existingProduct) {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || 'https://via.placeholder.com/300x300/DFBC94/B53324?text=Product'
            });
            this.saveWishlist(wishlist);
            this.displayWishlist();
            console.log('Product added to wishlist:', product.name);
        } else {
            console.log('Product already in wishlist:', product.name);
        }
    },

    // Remove product from wishlist
    removeFromWishlist: function(productId) {
        const wishlist = this.getWishlist();
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        this.saveWishlist(updatedWishlist);
        this.displayWishlist();
        console.log('Product removed from wishlist:', productId);
    },

    // Move product from wishlist to cart
    moveToCart: function(productId) {
        const wishlist = this.getWishlist();
        const product = wishlist.find(item => item.id === productId);
        
        if (product) {
            // Add to cart with quantity 1
            const cartProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            };
            
            window.cartManager.addProductToCart(cartProduct);
            // Remove from wishlist
            this.removeFromWishlist(productId);
            console.log('Product moved to cart:', product.name);
        }
    },

    // Display wishlist items
    displayWishlist: function() {
        const wishlistContainer = document.getElementById('wishlist-items');
        const emptyWishlist = document.getElementById('empty-wishlist');
        const wishlist = this.getWishlist();

        if (!wishlistContainer) return;

        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '';
            if (emptyWishlist) emptyWishlist.style.display = 'block';
        } else {
            if (emptyWishlist) emptyWishlist.style.display = 'none';
            
            wishlistContainer.innerHTML = wishlist.map(item => `
                <div class="wishlist-item" data-product-id="${item.id}">
                    <div class="wishlist-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="wishlist-item-info">
                        <h4 class="wishlist-item-title">${item.name}</h4>
                        <p class="wishlist-item-price">EGP ${item.price}</p>
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="wishlist-item-btn move-to-cart-btn" onclick="window.wishlistManager.moveToCart('${item.id}')">
                            🛒
                        </button>
                        <button class="wishlist-item-btn remove-wishlist-btn" onclick="window.wishlistManager.removeFromWishlist('${item.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },

    // Update wishlist count badge
    updateWishlistCount: function() {
        const wishlistCountBadge = document.getElementById('wishlist-count');
        if (wishlistCountBadge) {
            const wishlist = this.getWishlist();
            wishlistCountBadge.textContent = wishlist.length;
        }
    },

    // Initialize wishlist
    init: function() {
        this.displayWishlist();
        this.updateWishlistCount();
        console.log('Wishlist manager initialized');
    }
};
