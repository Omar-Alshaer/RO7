// Shop Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shop filters
    initializeShopFilters();
    
    // Initialize theme
    initializeTheme();
    
    // Update cart count using global cart manager
    if (window.cartManager) {
        window.cartManager.updateCartCount();
    }
});

// Initialize filter functionality
function initializeShopFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const offersFilter = document.getElementById('offers-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    // Add event listeners to filters
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (offersFilter) offersFilter.addEventListener('change', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Initialize cart functionality with better event handling
    initializeCartButtons();
    
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
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize cart buttons with proper event handling
function initializeCartButtons() {
    console.log('Initializing cart buttons...');
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log('Found add to cart buttons:', addToCartButtons.length);
    
    addToCartButtons.forEach((button, index) => {
        console.log(`Button ${index}:`, button);
        
        // Remove existing event listeners
        button.removeEventListener('click', addToCart);
        
        // Add new event listener
        button.addEventListener('click', addToCart);
        
        // Verify button has required data attributes
        const hasId = button.dataset.id;
        const hasName = button.dataset.name;
        const hasPrice = button.dataset.price;
        
        if (!hasId || !hasName || !hasPrice) {
            console.warn(`Button ${index} missing data attributes:`, {
                id: hasId,
                name: hasName,
                price: hasPrice
            });
        }
    });
    
    console.log('Cart buttons initialized');
}

// Apply filters to products
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const offersFilter = document.getElementById('offers-filter');
    
    // Get filter values (use empty string if element doesn't exist)
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const priceValue = priceFilter ? priceFilter.value : '';
    const offersValue = offersFilter ? offersFilter.value : '';
    
    console.log('Applying filters:', { categoryValue, priceValue, offersValue });
    
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    products.forEach(product => {
        const category = product.dataset.category;
        const price = parseInt(product.dataset.price);
        const offer = product.dataset.offer;
        
        let shouldShow = true;
        
        // Category filter
        if (categoryValue && category !== categoryValue) {
            shouldShow = false;
        }
        
        // Price filter
        if (priceValue) {
            if (priceValue === '0-50') {
                if (price < 0 || price > 50) shouldShow = false;
            } else if (priceValue === '50-100') {
                if (price < 50 || price > 100) shouldShow = false;
            } else if (priceValue === '100-200') {
                if (price < 100 || price > 200) shouldShow = false;
            } else if (priceValue === '200+') {
                if (price < 200) shouldShow = false;
            }
        }
        
        // Offers filter
        if (offersValue && offer !== offersValue) {
            shouldShow = false;
        }
        
        // Apply visibility
        if (shouldShow) {
            product.style.display = 'block';
            product.classList.remove('filtered-out');
            visibleCount++;
            console.log('Product visible:', product.querySelector('h3').textContent, { category, price, offer });
        } else {
            product.style.display = 'none';
            product.classList.add('filtered-out');
            console.log('Product filtered out:', product.querySelector('h3').textContent, { category, price, offer });
        }
    });
    
    // Show no results message if needed
    showNoResultsMessage(visibleCount === 0);
    
    console.log('Filter results:', { totalProducts: products.length, visibleCount, filteredCount: products.length - visibleCount });
    
    // Force grid reflow to remove gaps
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        // Get all products (both visible and filtered)
        const allProducts = Array.from(productsGrid.querySelectorAll('.product-card'));
        
        // Clear grid and re-add all products in original order
        productsGrid.innerHTML = '';
        allProducts.forEach(product => {
            productsGrid.appendChild(product);
        });
        
        // Force grid reflow
        productsGrid.style.display = 'none';
        setTimeout(() => {
            productsGrid.style.display = 'grid';
        }, 10);
    }
    
    // Update filter status
    updateFilterStatus();
}

// Show/hide no results message
function showNoResultsMessage(show) {
    let noResultsMsg = document.querySelector('.no-results');
    
    if (!noResultsMsg && show) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'no-results';
        noResultsMsg.innerHTML = `
            <div class="no-results-content">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onclick="clearAllFilters()" class="btn btn-primary">Clear Filters</button>
            </div>
        `;
        noResultsMsg.style.cssText = `
            text-align: center;
            padding: 3rem;
            background: var(--bg-secondary);
            border-radius: 15px;
            margin: 2rem 0;
            box-shadow: 0 5px 20px var(--shadow-color);
        `;
        
        const productsSection = document.querySelector('.products-section');
        if (productsSection) {
            productsSection.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg && !show) {
        noResultsMsg.remove();
    }
}

// Update filter status
function updateFilterStatus() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const offersFilter = document.getElementById('offers-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (!clearFiltersBtn) return;
    
    // Get filter values (use empty string if element doesn't exist)
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const priceValue = priceFilter ? priceFilter.value : '';
    const offersValue = offersFilter ? offersFilter.value : '';
    
    const hasActiveFilters = categoryValue || priceValue || offersValue;
    
    clearFiltersBtn.style.display = hasActiveFilters ? 'block' : 'none';
}

// Clear all filters
function clearAllFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const offersFilter = document.getElementById('offers-filter');
    
    if (categoryFilter) categoryFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (offersFilter) offersFilter.value = '';
    
    // Show all products
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        product.style.display = 'block';
        product.classList.remove('filtered-out');
        product.style.position = '';
        product.style.left = '';
    });
    
    // Restore original grid layout
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        // Get all products and restore original order
        const allProducts = Array.from(products);
        productsGrid.innerHTML = '';
        allProducts.forEach(product => {
            productsGrid.appendChild(product);
        });
        
        // Force grid reflow
        productsGrid.style.display = 'none';
        setTimeout(() => {
            productsGrid.style.display = 'grid';
        }, 10);
    }
    
    // Remove no results message
    const noResultsMsg = document.querySelector('.no-results');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
    
    // Update filter status
    updateFilterStatus();
}

// Enhanced add to cart function for shop page
function addToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target;
    console.log('Add to cart clicked:', button);
    
    const productId = button.dataset.id;
    const productName = button.dataset.name;
    const productPrice = parseInt(button.dataset.price);
    
    console.log('Product data from button:', { productId, productName, productPrice });
    
    // Validate data
    if (!productId || !productName || isNaN(productPrice) || productPrice <= 0) {
        console.error('Invalid product data:', { productId, productName, productPrice });
        showSuccessMessage('Error: Invalid product data');
        return;
    }
    
    // Create product data object
    const productData = {
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
        size: null,
        image: ''
    };
    
    console.log('Created product data:', productData);
    
    // Use global cart manager
    if (window.cartManager) {
        console.log('Cart manager available, adding product...');
        const success = window.cartManager.addProductToCart(productData);
        
        if (success) {
            // Show success message
            showSuccessMessage('Product added to cart!');
            
            // Animate button
            animateAddToCartButton(button);
            
            // Update cart count immediately
            window.cartManager.updateCartCount();
        } else {
            console.error('Failed to add product to cart');
            showSuccessMessage('Error: Could not add product to cart');
        }
    } else {
        console.error('Cart manager not available');
        showSuccessMessage('Error: Cart system not available');
    }
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
