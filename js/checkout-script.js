// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    initializeTheme();
    loadPromoCodeFromStorage(); // Load promo code from storage on page load
});

// Initialize checkout functionality
function initializeCheckout() {
    displayCheckoutItems();
    updateOrderSummary();
    initializeFormValidation();
    
    // Add event listeners
    document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
    
    // Promo code functionality
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    
    // Governorate change listener for shipping calculation
    const governorateSelect = document.getElementById('customer-governorate');
    if (governorateSelect) {
        governorateSelect.addEventListener('change', updateOrderSummary);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Display checkout items
function displayCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItemsContainer = document.getElementById('checkout-items');
    
    if (!cart || cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="no-items">No items in cart</p>';
        return;
    }
    
    checkoutItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const checkoutItem = createCheckoutItemElement(item);
        checkoutItemsContainer.appendChild(checkoutItem);
    });
}

// Create checkout item element
function createCheckoutItemElement(item) {
    const checkoutItem = document.createElement('div');
    checkoutItem.className = 'checkout-item';
    
    checkoutItem.innerHTML = `
        <div class="checkout-item-image">
            <img src="https://via.placeholder.com/80x80/DFBC94/B53324?text=${item.name.split(' ')[0]}" alt="${item.name}">
        </div>
        <div class="checkout-item-details">
            <h4>${item.name}</h4>
            <p class="checkout-item-price">EGP ${item.price}</p>
        </div>
        <div class="checkout-item-quantity">
            Qty: ${item.quantity}
        </div>
        <div class="checkout-item-total">
            EGP ${(item.price * item.quantity).toFixed(0)}
        </div>
    `;
    
    return checkoutItem;
}

// Global variables for promo code
let appliedPromoCode = null;
let promoDiscount = 0;
let promoCodeData = null; // Store full promo code data

// Update order summary
function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate shipping based on governorate
    const governorateSelect = document.getElementById('customer-governorate');
    let shipping = 30; // Default shipping
    
    if (governorateSelect && governorateSelect.value) {
        const governorate = governorateSelect.value;
        shipping = calculateShippingForGovernorate(governorate);
    }
    
    // Apply promo discount
    const total = subtotal + shipping - promoDiscount;
    
    document.getElementById('checkout-subtotal').textContent = `EGP ${subtotal.toFixed(0)}`;
    document.getElementById('checkout-shipping').textContent = `EGP ${shipping.toFixed(0)}`;
    document.getElementById('checkout-total').textContent = `EGP ${total.toFixed(0)}`;
    
    // Show/hide discount container
    const discountContainer = document.getElementById('checkout-discount-container');
    const discountElement = document.getElementById('checkout-discount');
    
    if (promoDiscount > 0) {
        discountContainer.style.display = 'flex';
        discountElement.textContent = `-EGP ${promoDiscount.toFixed(0)} (${appliedPromoCode})`;
    } else {
        discountContainer.style.display = 'none';
    }
}

// Calculate shipping for governorate
function calculateShippingForGovernorate(governorate) {
    if (!governorate) return 30; // Default shipping
    
    // Northern governorates - 60 EGP
    const northernGovernorates = [
        'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 
        'Fayoum', 'Gharbiya', 'Ismailia', 'Menoufia', 'Qaliubiya', 
        'New Valley', 'Suez', 'Port Said', 'Damietta', 'Sharkia', 
        'North Sinai', 'South Sinai'
    ];
    
    // Southern governorates - 90 EGP
    const southernGovernorates = [
        'Minya', 'Assiut', 'Beni Suef', 'Sohag', 'Qena', 'Kafr Al sheikh', 
        'Matrouh', 'Luxor', 'Aswan'
    ];
    
    if (northernGovernorates.includes(governorate)) {
        return 60;
    } else if (southernGovernorates.includes(governorate)) {
        return 90;
    } else {
        return 30; // Default
    }
}

// Apply promo code
async function applyPromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoMessage = document.getElementById('promo-message');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    try {
        // Load promo codes from JSON file
        const response = await fetch('promo-codes.json');
        if (!response.ok) {
            throw new Error('Failed to load promo codes');
        }
        
        const promoData = await response.json();
        const foundPromoCode = promoData.promo_codes.find(code => code.code === promoCode);
        
        if (!foundPromoCode) {
            showPromoMessage('Invalid promo code', 'error');
            clearPromoCode();
            return;
        }
        
        // Check if promo code is still valid
        const currentDate = new Date();
        const validUntil = new Date(foundPromoCode.valid_until);
        
        if (currentDate > validUntil) {
            showPromoMessage('Promo code has expired', 'error');
            clearPromoCode();
            return;
        }
        
        // Check usage limit
        if (foundPromoCode.used_count >= foundPromoCode.usage_limit) {
            showPromoMessage('Promo code usage limit reached', 'error');
            clearPromoCode();
            return;
        }
        
        // Check minimum order amount
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        if (subtotal < foundPromoCode.min_order) {
            showPromoMessage(`Minimum order amount: EGP ${foundPromoCode.min_order}`, 'error');
            clearPromoCode();
            return;
        }
        
        // Calculate discount
        const discountAmount = (subtotal * foundPromoCode.discount_percentage) / 100;
        const finalDiscount = Math.min(discountAmount, foundPromoCode.max_discount);
        
        // Apply promo code
        appliedPromoCode = promoCode;
        promoDiscount = finalDiscount;
        promoCodeData = foundPromoCode; // Store full data
        
        // Save to localStorage for persistence
        localStorage.setItem('appliedPromoCode', promoCode);
        localStorage.setItem('promoDiscount', finalDiscount.toString());
        localStorage.setItem('promoCodeData', JSON.stringify(foundPromoCode));
        
        showPromoMessage(`Promo code applied! ${foundPromoCode.discount_percentage}% off (max: EGP ${foundPromoCode.max_discount})`, 'success');
        
        // Update order summary
        updateOrderSummary();
        
        // Disable input and button
        promoInput.disabled = true;
        document.getElementById('apply-promo').disabled = true;
        
        // Add remove promo code button
        addRemovePromoButton();
        
    } catch (error) {
        console.error('Error applying promo code:', error);
        showPromoMessage('Error applying promo code. Please try again.', 'error');
        clearPromoCode();
    }
}

// Clear promo code
function clearPromoCode() {
    appliedPromoCode = null;
    promoDiscount = 0;
    promoCodeData = null;
    
    // Clear localStorage
    localStorage.removeItem('appliedPromoCode');
    localStorage.removeItem('promoDiscount');
    localStorage.removeItem('promoCodeData');
    
    // Reset input and button
    const promoInput = document.getElementById('promo-code');
    const applyBtn = document.getElementById('apply-promo');
    
    if (promoInput) {
        promoInput.disabled = false;
        promoInput.value = '';
    }
    
    if (applyBtn) {
        applyBtn.disabled = false;
    }
    
    // Remove remove button if exists
    const removeBtn = document.querySelector('.remove-promo-btn');
    if (removeBtn) {
        removeBtn.remove();
    }
    
    // Update order summary
    updateOrderSummary();
    
    // Clear message
    const promoMessage = document.getElementById('promo-message');
    if (promoMessage) {
        promoMessage.textContent = '';
        promoMessage.className = 'promo-message';
    }
}

// Add remove promo code button
function addRemovePromoButton() {
    const promoSection = document.querySelector('.promo-code-input');
    if (!promoSection || document.querySelector('.remove-promo-btn')) {
        return;
    }
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-danger remove-promo-btn';
    removeBtn.textContent = '❌ Remove';
    removeBtn.style.cssText = `
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    removeBtn.addEventListener('click', clearPromoCode);
    promoSection.appendChild(removeBtn);
}

// Load promo code from localStorage on page load
function loadPromoCodeFromStorage() {
    const savedPromoCode = localStorage.getItem('appliedPromoCode');
    const savedPromoDiscount = localStorage.getItem('promoDiscount');
    const savedPromoCodeData = localStorage.getItem('promoCodeData');
    
    if (savedPromoCode && savedPromoDiscount && savedPromoCodeData) {
        appliedPromoCode = savedPromoCode;
        promoDiscount = parseFloat(savedPromoDiscount);
        promoCodeData = JSON.parse(savedPromoCodeData);
        
        // Disable input and button
        const promoInput = document.getElementById('promo-code');
        const applyBtn = document.getElementById('apply-promo');
        
        if (promoInput) {
            promoInput.value = savedPromoCode;
            promoInput.disabled = true;
        }
        
        if (applyBtn) {
            applyBtn.disabled = true;
        }
        
        // Add remove button
        addRemovePromoButton();
        
        // Update order summary
        updateOrderSummary();
    }
}

// Show promo message
function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promo-message');
    promoMessage.textContent = message;
    promoMessage.className = `promo-message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }, 5000);
    }
}

// Initialize form validation
function initializeFormValidation() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Add form submit handler
    form.addEventListener('submit', handleFormSubmit);
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^01[0-9]{9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid Egyptian phone number starting with 01 (e.g., 01283548248)';
        }
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Show/hide error
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(event);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError({ target: field });
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff6b6b;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: slideInDown 0.3s ease-out;
    `;
    
    // Insert error after field
    field.parentNode.appendChild(errorElement);
    
    // Add error styling to field
    field.style.borderColor = '#ff6b6b';
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '';
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showSuccessMessage('Please fix the errors above');
        return;
    }
    
    // Collect customer information
    const customerInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        governorate: formData.get('governorate'),
        address: formData.get('address'),
        notes: formData.get('notes')
    };
    
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate order totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingForGovernorate(customerInfo.governorate);
    const total = subtotal + shipping - promoDiscount;
    
    // Fill hidden fields with order details
    document.getElementById('order-items').value = JSON.stringify(cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
    })));
    document.getElementById('order-subtotal').value = `EGP ${subtotal.toFixed(2)}`;
    document.getElementById('order-shipping').value = `EGP ${shipping.toFixed(2)}`;
    document.getElementById('order-discount').value = promoDiscount > 0 ? `EGP ${promoDiscount.toFixed(2)}` : 'EGP 0.00';
    document.getElementById('order-total').value = `EGP ${total.toFixed(2)}`;
    document.getElementById('order-receipt-number').value = generateOrderId();
    
    // Create order
    const order = {
        id: generateOrderId(),
        customer: customerInfo,
        items: cart,
        orderDate: new Date().toISOString(),
        status: 'pending',
        appliedPromoCode: appliedPromoCode,
        promoDiscount: promoDiscount,
        shipping: shipping,
        subtotal: subtotal,
        total: total
    };
    
    // Save order to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Clear cart and promo data
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedPromoCode');
    localStorage.removeItem('promoDiscount');
    localStorage.removeItem('promoCodeData');
    
    // Show success message
    showSuccessMessage('Order submitted successfully! Redirecting to confirmation...');
    
    // Redirect to confirmation page
    setTimeout(() => {
        window.location.href = 'order-confirmation.html';
    }, 1500);
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const form = event.target;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showPromoMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Submit the order
    submitOrder();
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RO7-${timestamp}-${random}`;
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

// Submit order
function submitOrder() {
    // Get form data
    const formData = new FormData(document.getElementById('checkout-form'));
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        governorate: formData.get('governorate'),
        address: formData.get('address'),
        notes: formData.get('notes') || ''
    };
    
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showPromoMessage('Your cart is empty. Please add items before checkout.', 'error');
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingForGovernorate(customerData.governorate);
    const total = subtotal + shipping - promoDiscount;
    
    // Create order object with complete promo code data
    const orderData = {
        id: generateOrderId(),
        customer: customerData,
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        promoCode: appliedPromoCode,
        promoDiscount: promoDiscount,
        promoCodeData: promoCodeData, // Include full promo code details
        total: total,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save order to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Update hidden form fields for API submission
    updateHiddenFormFields(orderData);
    
    // Clear cart and promo data
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedPromoCode');
    localStorage.removeItem('promoDiscount');
    localStorage.removeItem('promoCodeData');
    
    // Show success message
    showSuccessMessage('Order submitted successfully! Redirecting to confirmation...');
    
    // Redirect to confirmation page
    setTimeout(() => {
        window.location.href = 'order-confirmation.html';
    }, 1500);
}

// Update hidden form fields for API submission
function updateHiddenFormFields(orderData) {
    // Update hidden fields with complete order data
    const hiddenFields = {
        'order-items': JSON.stringify(orderData.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            image: item.image || ''
        }))),
        'order-subtotal': `EGP ${orderData.subtotal.toFixed(0)}`,
        'order-shipping': `EGP ${orderData.shipping.toFixed(0)}`,
        'order-discount': orderData.promoDiscount > 0 ? `EGP ${orderData.promoDiscount.toFixed(0)}` : 'EGP 0',
        'order-total': `EGP ${orderData.total.toFixed(0)}`,
        'order-receipt-number': orderData.id
    };
    
    // Update each hidden field
    Object.keys(hiddenFields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = hiddenFields[fieldId];
        }
    });
    
    // Add additional hidden fields for promo code details
    if (orderData.promoCodeData) {
        const promoFields = {
            'promo-code-applied': orderData.promoCode,
            'promo-discount-percentage': orderData.promoCodeData.discount_percentage.toString(),
            'promo-max-discount': orderData.promoCodeData.max_discount.toString(),
            'promo-description': orderData.promoCodeData.description || ''
        };
        
        Object.keys(promoFields).forEach(fieldName => {
            let field = document.getElementById(fieldName);
            if (!field) {
                // Create hidden field if it doesn't exist
                field = document.createElement('input');
                field.type = 'hidden';
                field.id = fieldName;
                field.name = fieldName;
                document.getElementById('checkout-form').appendChild(field);
            }
            field.value = promoFields[fieldName];
        });
    }
}
