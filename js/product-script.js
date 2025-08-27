// Product Page JavaScript

// Product Page JavaScript - Uses global cart manager

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all functionality
        initializeProductGallery();
        initializeTabs();
        initializeAddToCart();
        initializeWishlist();
        initializeRelatedProducts();
        initializeAnimations();
        
        // Initialize theme
        initializeTheme();
        
        // Initialize cart if available
        if (window.cartManager) {
            window.cartManager.initializeCart();
        }
        
            // Add theme toggle event listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    }
        
    } catch (error) {
        console.error('Error initializing product page:', error);
    }
});

// Initialize product image gallery
async function initializeProductGallery() {
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            console.error('No product ID found in URL');
            return;
        }
        
        // Load product data from JSON
        const response = await fetch('products.json');
        const data = await response.json();
        const product = data.products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        console.log('Product data loaded:', product);
        
        // Update main image
    const mainImage = document.getElementById('main-image');
        if (mainImage && product.mainImage) {
            mainImage.src = product.mainImage;
            mainImage.alt = product.name;
        }
        
        // Update thumbnail gallery
        updateThumbnailGallery(product.gallery);
        
        // Update product details
        updateProductDetails(product);
        
        // Update product specifications
        updateProductSpecifications(product);
        
        // Update product reviews
        updateProductReviews(product);
        
        // Load and display related products
        loadRelatedProducts(product);
        
        // Initialize thumbnail click events
        initializeThumbnailEvents();
        
        // Initialize zoom functionality
        initializeZoomFunctionality();
        
    } catch (error) {
        console.error('Error loading product data:', error);
    }
}

// Load and display related products
async function loadRelatedProducts(currentProduct) {
    try {
        // Load all products from JSON
        const response = await fetch('products.json');
        const data = await response.json();
        
        // Filter related products (same category, different product)
        const relatedProducts = data.products.filter(product => 
            product.id !== currentProduct.id && 
            product.category === currentProduct.category
        );
        
        // If not enough products in same category, add products from other categories
        let finalRelatedProducts = [...relatedProducts];
        if (finalRelatedProducts.length < 4) {
            const otherProducts = data.products.filter(product => 
                product.id !== currentProduct.id && 
                product.category !== currentProduct.category
            );
            finalRelatedProducts = [...finalRelatedProducts, ...otherProducts];
        }
        
        // Take only 4 products
        finalRelatedProducts = finalRelatedProducts.slice(0, 4);
        
        // Display related products
        displayRelatedProducts(finalRelatedProducts);
        
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products in the grid
function displayRelatedProducts(products) {
    const relatedProductsGrid = document.getElementById('related-products-grid');
    if (!relatedProductsGrid || !products || products.length === 0) {
        return;
    }
    
    // Clear existing content
    relatedProductsGrid.innerHTML = '';
    
    // Create product cards
    products.forEach(product => {
        const productCard = createRelatedProductCard(product);
        relatedProductsGrid.appendChild(productCard);
    });
}

// Create a related product card
function createRelatedProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.productId = product.id;
    
    // Create product image
    const productImage = document.createElement('img');
    productImage.src = product.mainImage || `https://via.placeholder.com/300x250/${getRandomColor()}/B53324?text=${product.name}`;
    productImage.alt = product.name;
    
    // Create product info
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';
    
    const productTitle = document.createElement('h3');
    productTitle.textContent = product.name;
    
    const productPrice = document.createElement('p');
    productPrice.className = 'price';
    if (product.discount > 0) {
        productPrice.innerHTML = `
            <span class="current-price">EGP ${product.currentPrice}</span>
            <span class="original-price">EGP ${product.originalPrice}</span>
        `;
    } else {
        productPrice.textContent = `EGP ${product.currentPrice}`;
    }
    
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn btn-primary add-to-cart';
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.dataset.id = product.id;
    addToCartBtn.dataset.name = product.name;
    addToCartBtn.dataset.price = product.currentPrice;
    
    // Add event listener for add to cart
    addToCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const productData = {
            id: this.dataset.id,
            name: this.dataset.name,
            price: parseInt(this.dataset.price),
            quantity: 1,
            image: productImage.src
        };
        
        if (window.cartManager) {
            const success = window.cartManager.addProductToCart(productData);
            if (success) {
                showSuccessMessage('Product added to cart!');
                animateAddToCartButton(this);
            }
        }
    });
    
    // Add event listener for product card click (navigate to product page)
    productCard.addEventListener('click', function(e) {
        // Don't navigate if clicking on add to cart button
        if (e.target.classList.contains('add-to-cart')) {
        return;
    }
    
        // Navigate to product page
        window.location.href = `product.html?id=${product.id}`;
    });
    
    // Add hover effect for clickable card
    productCard.style.cursor = 'pointer';
    
    // Assemble the card
    productInfo.appendChild(productTitle);
    productInfo.appendChild(productPrice);
    productInfo.appendChild(addToCartBtn);
    
    productCard.appendChild(productImage);
    productCard.appendChild(productInfo);
    
    return productCard;
}

// Update thumbnail gallery with product images
function updateThumbnailGallery(galleryImages) {
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    if (!thumbnailGallery || !galleryImages || galleryImages.length === 0) {
        return;
    }
    
    // Clear existing thumbnails
    thumbnailGallery.innerHTML = '';
    
    // Create thumbnails for each image
    galleryImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.dataset.image = imageSrc;
        
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = imageSrc;
        thumbnailImg.alt = `Product Image ${index + 1}`;
        
        // Use placeholder if image is not available
        if (imageSrc.includes('placeholder') || !imageSrc) {
            thumbnailImg.src = `https://via.placeholder.com/120x100/${getRandomColor()}/B53324?text=${index + 1}`;
        }
        
        thumbnail.appendChild(thumbnailImg);
        thumbnailGallery.appendChild(thumbnail);
    });
}

// Get random color for placeholder images
function getRandomColor() {
    const colors = ['DFBC94', 'E5A657', 'F5E2CE', 'B53324'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Update product details
function updateProductDetails(product) {
    // Update product title
    const productTitle = document.querySelector('.product-title');
    if (productTitle) {
        productTitle.textContent = product.name;
    }
    
    // Update product price
    const currentPrice = document.querySelector('.current-price');
    const originalPrice = document.querySelector('.original-price');
    const discountBadge = document.querySelector('.discount-badge');
    
    if (currentPrice) currentPrice.textContent = `EGP ${product.currentPrice}`;
    if (originalPrice) {
        originalPrice.textContent = `EGP ${product.originalPrice}`;
        if (product.discount === 0) {
            originalPrice.style.display = 'none';
        }
    }
    if (discountBadge && product.discount > 0) {
        discountBadge.textContent = `Save ${product.discount}%`;
    } else if (discountBadge) {
        discountBadge.style.display = 'none';
    }
    
    // Update product description
    const productDescription = document.querySelector('.product-description p');
    if (productDescription) {
        productDescription.textContent = product.shortDescription;
    }
    
    // Update product meta
    const availabilityElement = document.querySelector('.meta-item .meta-value.in-stock');
    const skuElement = document.querySelector('.meta-item .meta-value');
    const categoryElement = document.querySelectorAll('.meta-item .meta-value')[2];
    
    if (availabilityElement) {
        availabilityElement.textContent = `In Stock (${product.availability} available)`;
    }
    if (skuElement) {
        skuElement.textContent = product.sku;
    }
    if (categoryElement) {
        categoryElement.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    }
    
    // Update add to cart button data
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.dataset.id = product.id;
        addToCartBtn.dataset.name = product.name;
        addToCartBtn.dataset.price = product.currentPrice;
    }
}

// Update product specifications
function updateProductSpecifications(product) {
    const descriptionText = document.querySelector('.description-text');
    const featuresList = document.querySelector('.features-list');
    const perfectForList = document.querySelector('.perfect-for-list');
    const specsGrid = document.querySelector('.specs-grid');
    
    // Update description
    if (descriptionText) {
        descriptionText.textContent = product.longDescription;
    }
    
    // Update features
    if (featuresList && product.features) {
        featuresList.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    // Update perfect for
    if (perfectForList && product.perfectFor) {
        perfectForList.innerHTML = '';
        product.perfectFor.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            perfectForList.appendChild(li);
        });
    }
    
    // Update specifications
    if (specsGrid && product.specifications) {
        specsGrid.innerHTML = '';
        Object.entries(product.specifications).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            
            const specLabel = document.createElement('span');
            specLabel.className = 'spec-label';
            specLabel.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1') + ':';
            
            const specValue = document.createElement('span');
            specValue.className = 'spec-value';
            specValue.textContent = value;
            
            specItem.appendChild(specLabel);
            specItem.appendChild(specValue);
            specsGrid.appendChild(specItem);
        });
    }
}

// Update product reviews
function updateProductReviews(product) {
    const ratingNumber = document.querySelector('.rating-number');
    const ratingText = document.querySelector('.rating-text');
    const ratingBreakdown = document.querySelector('.rating-breakdown');
    const reviewsList = document.querySelector('.reviews-list');
    
    // Update rating number
    if (ratingNumber) {
        ratingNumber.textContent = product.rating;
    }
    
    // Update rating text
    if (ratingText) {
        ratingText.textContent = `Based on ${product.reviewsCount} reviews`;
    }
    
    // Update rating breakdown (simplified)
    if (ratingBreakdown) {
        ratingBreakdown.innerHTML = `
            <div class="rating-bar">
                <span>5 stars</span>
                <div class="bar"><div class="fill" style="width: ${Math.round(product.rating * 20)}%"></div></div>
                <span>${Math.round(product.reviewsCount * (product.rating / 5))}</span>
            </div>
        `;
    }
    
    // Update reviews list
    if (reviewsList && product.reviews) {
        reviewsList.innerHTML = '';
        product.reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-name">${review.name}</div>
                    <div class="review-stars">${'⭐'.repeat(review.rating)}</div>
                    <div class="review-date">${review.date}</div>
                </div>
                <div class="review-text">${review.text}</div>
            `;
            
            reviewsList.appendChild(reviewItem);
        });
    }
}

// Initialize thumbnail click events
function initializeThumbnailEvents() {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (!mainImage || thumbnails.length === 0) {
        return;
    }
    
    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image
            const newImageSrc = this.getAttribute('data-image');
            if (newImageSrc && !newImageSrc.includes('placeholder')) {
            mainImage.src = newImageSrc;
            
            // Add fade effect
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 150);
            }
        });
    });
}
    
// Initialize zoom functionality
function initializeZoomFunctionality() {
    const zoomBtn = document.getElementById('zoom-btn');
    const mainImage = document.getElementById('main-image');
    
    if (zoomBtn && mainImage) {
        zoomBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openImageModal(mainImage.src);
        });
    }
}

// Open image modal for zoom
function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const modalImage = document.createElement('img');
    modalImage.src = imageSrc;
    modalImage.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    modal.appendChild(modalImage);
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalImage.style.transform = 'scale(1)';
    }, 10);
    
    // Close on click
    modal.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.opacity = '0';
        modalImage.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
}





// Initialize tabs
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');
    
    if (tabBtns.length === 0 || tabContents.length === 0) {
        return;
    }
    
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize add to cart functionality
function initializeAddToCart() {
    const addToCartBtn = document.getElementById('add-to-cart');
    
    if (!addToCartBtn) {
        console.log('Add to cart button not found');
        return;
    }
    
    console.log('Add to cart button found:', addToCartBtn);
    console.log('Button data attributes:', addToCartBtn.dataset);
    
    // Remove existing event listeners to prevent duplicates
    addToCartBtn.removeEventListener('click', handleAddToCart);
    
    // Add new event listener
    addToCartBtn.addEventListener('click', handleAddToCart);
    
    console.log('Add to cart event listener attached');
}

// Handle add to cart click
function handleAddToCart(e) {
        e.preventDefault();
        e.stopPropagation();
    
    console.log('Add to cart button clicked');
    
        const productData = getProductData();
        console.log('Product data:', productData);
        
    if (productData && window.cartManager) {
        console.log('Cart manager available, adding product...');
        const success = window.cartManager.addProductToCart(productData);
        if (success) {
            showSuccessMessage('Product added to cart!');
            animateAddToCartButton(e.target);
            
            // Update cart count immediately
            window.cartManager.updateCartCount();
        } else {
            console.error('Failed to add product to cart');
            showSuccessMessage('Error: Could not add product to cart');
        }
        } else {
        console.error('Missing product data or cart manager:', { productData, cartManager: !!window.cartManager });
            showSuccessMessage('Error: Could not add product to cart');
        }
}

// Get product data for cart
function getProductData() {
    const addToCartBtn = document.getElementById('add-to-cart');
    
    console.log('Getting product data:', { addToCartBtn });
    
    if (!addToCartBtn) {
        console.error('Missing add to cart button');
        return null;
    }
    
    // Validate all required data
    if (!addToCartBtn.dataset.id || !addToCartBtn.dataset.name || !addToCartBtn.dataset.price) {
        console.error('Missing button data attributes:', addToCartBtn.dataset);
        return null;
    }
    
    const mainImage = document.getElementById('main-image');
    
    const productData = {
        id: addToCartBtn.dataset.id,
        name: addToCartBtn.dataset.name,
        size: null, // No size selection
        price: parseInt(addToCartBtn.dataset.price),
        quantity: 1, // Default quantity is 1
        image: mainImage ? mainImage.src : ''
    };
    
    console.log('Created product data:', productData);
    return productData;
}

// Animate add to cart button
function animateAddToCartButton(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    // Change button text temporarily
    button.textContent = 'Added! ✓';
    button.style.background = 'var(--gold)';
    button.style.transform = 'scale(0.95)';
    
    // Reset after animation
                setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
        button.style.transform = 'scale(1)';
    }, 1500);
}

// Show success message
function showSuccessMessage(message) {
    if (!message || typeof message !== 'string') {
        return;
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.5s ease;
        font-weight: 700;
        font-size: 1.1rem;
    `;
    
    document.body.appendChild(successDiv);
    
    // Animate in
    setTimeout(() => {
        successDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 500);
    }, 3000);
}

// Initialize wishlist functionality
function initializeWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    
    if (!wishlistBtn) {
        return;
    }
    
    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isInWishlist = this.classList.contains('active');
        
        if (isInWishlist) {
            this.classList.remove('active');
            this.innerHTML = '♡ Add to Wishlist';
            showSuccessMessage('Removed from wishlist');
        } else {
            this.classList.add('active');
            this.innerHTML = '♥ In Wishlist';
            showSuccessMessage('Added to wishlist');
        }
    });
}

// Initialize related products
function initializeRelatedProducts() {
    const relatedProducts = document.querySelectorAll('.product-card');
    
    if (relatedProducts.length === 0) {
        return;
    }
    
    relatedProducts.forEach((product) => {
        product.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.dataset.productId;
            // Navigate to product page
            window.location.href = `product.html?id=${productId}`;
        });
    });
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.product-images, .product-details, .product-options, .specs-tabs, .related-products');
    
    if (animatedElements.length === 0) {
        return;
    }
    
    animatedElements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}



// Theme management functions
function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        themeToggle.setAttribute('data-theme', currentTheme);
    }
}

function toggleTheme() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
}
