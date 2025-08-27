// Products Data Loader
// This file loads and manages product data from products.json

class ProductsLoader {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing products loader:', error);
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            this.products = data.products;
            console.log('Products loaded successfully:', this.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to hardcoded products if JSON fails
            this.products = this.getFallbackProducts();
        }
    }

    getFallbackProducts() {
        return [
            {
                id: "1",
                name: "Professional Brush Set",
                currentPrice: 150,
                originalPrice: 180,
                discount: 17,
                mainImage: "assets/temp/ro7_story.png",
                category: "brushes"
            },
            {
                id: "2", 
                name: "Premium Canvas Roll",
                currentPrice: 200,
                originalPrice: 200,
                discount: 0,
                mainImage: "https://via.placeholder.com/300x300/E5A657/B53324?text=Canvas+Roll",
                category: "canvas"
            },
            {
                id: "3",
                name: "Acrylic Paint Set", 
                currentPrice: 180,
                originalPrice: 220,
                discount: 18,
                mainImage: "https://via.placeholder.com/300x300/F5E2CE/B53324?text=Acrylic+Set",
                category: "paints"
            }
        ];
    }

    setupEventListeners() {
        // Listen for product selection from shop page
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = e.target.dataset.id;
                this.selectProduct(productId);
            }
        });

        // Handle direct product page access
        if (window.location.pathname.includes('product.html')) {
            this.handleProductPage();
        }
    }

    selectProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // Store selected product in sessionStorage
            sessionStorage.setItem('selectedProduct', JSON.stringify(product));
            // Navigate to product page
            window.location.href = 'product.html';
        }
    }

    handleProductPage() {
        // Get product from sessionStorage or URL params
        let product = null;
        
        // Try to get from sessionStorage first
        const storedProduct = sessionStorage.getItem('selectedProduct');
        if (storedProduct) {
            product = JSON.parse(storedProduct);
            sessionStorage.removeItem('selectedProduct'); // Clear after use
        } else {
            // Try to get from URL params
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            if (productId) {
                product = this.products.find(p => p.id === productId);
            }
        }

        if (product) {
            this.displayProduct(product);
        } else {
            // Default to first product if none selected
            this.displayProduct(this.products[0]);
        }
    }

    displayProduct(product) {
        this.currentProduct = product;
        
        // Update page title
        document.title = `${product.name} - Ro7 Art Hub`;
        
        // Update main product image
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.src = product.mainImage;
            mainImage.alt = product.name;
        }

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
            if (product.discount > 0) {
                originalPrice.textContent = `EGP ${product.originalPrice}`;
                originalPrice.style.display = 'inline';
            } else {
                originalPrice.style.display = 'none';
            }
        }
        if (discountBadge) {
            if (product.discount > 0) {
                discountBadge.textContent = `Save ${product.discount}%`;
                discountBadge.style.display = 'inline';
            } else {
                discountBadge.style.display = 'none';
            }
        }

        // Update product description
        const description = document.querySelector('.product-description p');
        if (description) {
            description.textContent = product.shortDescription || product.longDescription;
        }

        // Update SKU
        const skuElement = document.querySelector('.meta-value');
        if (skuElement && product.sku) {
            skuElement.textContent = product.sku;
        }

        // Update availability
        const availabilityElement = document.querySelector('.meta-value.in-stock');
        if (availabilityElement && product.availability) {
            availabilityElement.textContent = `In Stock (${product.availability} available)`;
        }

        // Update add to cart button
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.dataset.id = product.id;
            addToCartBtn.dataset.name = product.name;
            addToCartBtn.dataset.price = product.currentPrice;
        }

        // Update gallery images
        this.updateGallery(product);

        // Update specifications
        this.updateSpecifications(product);

        // Update reviews
        this.updateReviews(product);

        // Update shipping info
        this.updateShippingInfo(product);
    }

    updateGallery(product) {
        if (!product.gallery) return;
        
        const galleryContainer = document.querySelector('.product-gallery');
        if (!galleryContainer) return;

        // Update main image
        const mainImage = document.getElementById('main-image');
        if (mainImage && product.gallery.length > 0) {
            mainImage.src = product.gallery[0];
            mainImage.alt = product.name;
        }

        // Update thumbnails
        const thumbnailsContainer = document.querySelector('.thumbnails');
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = '';
            
            product.gallery.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';
                thumbnail.dataset.image = image;
                
                const img = document.createElement('img');
                img.src = image;
                img.alt = `${product.name} ${index + 1}`;
                
                thumbnail.appendChild(img);
                thumbnailsContainer.appendChild(thumbnail);
            });
        }
    }

    updateSpecifications(product) {
        if (!product.specifications) return;
        
        const specsContainer = document.querySelector('#specifications .specs-grid');
        if (!specsContainer) return;

        specsContainer.innerHTML = '';
        
        Object.entries(product.specifications).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            
            const label = document.createElement('span');
            label.className = 'spec-label';
            label.textContent = this.formatSpecLabel(key) + ':';
            
            const specValue = document.createElement('span');
            specValue.className = 'spec-value';
            specValue.textContent = value;
            
            specItem.appendChild(label);
            specItem.appendChild(specValue);
            specsContainer.appendChild(specItem);
        });
    }

    updateReviews(product) {
        if (!product.reviews) return;
        
        const reviewsContainer = document.querySelector('.reviews-list');
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = '';
        
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
            
            reviewsContainer.appendChild(reviewItem);
        });

        // Update overall rating
        const ratingNumber = document.querySelector('.rating-number');
        const ratingText = document.querySelector('.rating-text');
        
        if (ratingNumber && product.rating) {
            ratingNumber.textContent = product.rating;
        }
        if (ratingText && product.reviewsCount) {
            ratingText.textContent = `Based on ${product.reviewsCount} reviews`;
        }
    }

    updateShippingInfo(product) {
        if (!product.shipping) return;
        
        const shippingContainer = document.querySelector('#shipping .shipping-info');
        if (!shippingContainer) return;

        shippingContainer.innerHTML = '';
        
        Object.values(product.shipping).forEach(option => {
            const shippingOption = document.createElement('div');
            shippingOption.className = 'shipping-option';
            
            shippingOption.innerHTML = `
                <h4>${option.name}</h4>
                <p>${option.description}</p>
                <p>Delivery time: ${option.time}</p>
                <p class="shipping-cost">Cost: EGP ${option.cost}</p>
            `;
            
            shippingContainer.appendChild(shippingOption);
        });
    }

    formatSpecLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
                 .replace(/^./, str => str.toUpperCase());
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }
}

// Initialize products loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsLoader = new ProductsLoader();
});

// Export for use in other files
window.ProductsLoader = ProductsLoader;
