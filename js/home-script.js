// Home Featured Products Loader
(function() {
    async function loadFeaturedProducts() {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            const products = Array.isArray(data.products) ? data.products : [];

            // Choose featured products: first check for featured: true, then fallback to auto-selection
            let featured = products.filter(p => p.featured === true);
            
            // If no featured products are marked, use auto-selection as fallback
            if (featured.length === 0) {
                console.log('No featured products found, using auto-selection...');
                featured = products
                    .slice()
                    .sort((a, b) => {
                        const scoreA = (a.discount || 0) * 2 + (a.rating || 0);
                        const scoreB = (b.discount || 0) * 2 + (b.rating || 0);
                        return scoreB - scoreA;
                    })
                    .slice(0, 3);
            } else {
                console.log(`Found ${featured.length} featured products`);
            }

            // Ensure we only show max 3 products
            featured = featured.slice(0, 3);
            
            console.log('Featured products selected:', featured.length);
            console.log('Featured products:', featured.map(p => ({ id: p.id, name: p.name, featured: p.featured })));
            
            renderFeaturedProducts(featured);
        } catch (err) {
            console.error('Failed to load featured products:', err);
        }
    }

    function renderFeaturedProducts(items) {
        const container = document.getElementById('featured-products');
        if (!container) return;

        console.log('Rendering', items.length, 'featured products');

        container.innerHTML = items.map(p => {
            const hasDiscount = (p.discount || 0) > 0 && p.originalPrice && p.originalPrice > p.currentPrice;
            const originalPriceHtml = hasDiscount ? `<span class="original-price">EGP ${p.originalPrice}</span>` : '';
            const discountBadge = hasDiscount ? `<span class="discount-percentage">-${p.discount}%</span>` : '';
            
            // Better badge logic
            let badges = '';
            if (hasDiscount) {
                badges = '<span class="sale-badge">SALE</span>';
            } else if ((p.rating || 0) >= 4.7) {
                badges = '<span class="best-seller-badge">BEST SELLER</span>';
            } else if ((p.reviewsCount || 0) > 100) {
                badges = '<span class="new-badge">NEW</span>';
            }

            const image = p.mainImage || 'https://via.placeholder.com/300x300/DFBC94/B53324?text=Product';
            const category = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Art Supply';

            return `
            <div class="featured-product-card">
                <div class="product-image-container">
                    <img src="${image}" alt="${escapeHtml(p.name)}" class="product-image">
                    <div class="product-overlay">
                        <div class="product-badges">
                            ${badges}
                            ${discountBadge}
                        </div>
                        <div class="product-category">${category}</div>
                    </div>
                </div>
                
                <div class="product-details">
                    <h3 class="product-title">${escapeHtml(p.name)}</h3>
                    
                    <div class="product-price-container">
                        <span class="current-price">EGP ${p.currentPrice}</span>
                        ${originalPriceHtml}
                    </div>
                    
                    <a href="product.html?id=${p.id}" class="view-product-btn">
                        <span>View Product</span>
                    </a>
                </div>
            </div>`;
        }).join('');

        // Add loading animation
        container.classList.add('loaded');
    }

    function renderStars(rating) {
        const r = Math.round(rating || 0);
        const filledStars = '★'.repeat(Math.max(0, Math.min(5, r)));
        const emptyStars = '☆'.repeat(5 - Math.max(0, Math.min(5, r)));
        return filledStars + emptyStars;
    }

    function escapeHtml(str) {
        return String(str || '').replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    }

    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
})();
