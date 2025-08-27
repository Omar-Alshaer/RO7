// Order Confirmation Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeConfirmation();
    initializeTheme();
});

// Initialize confirmation functionality
function initializeConfirmation() {
    displayOrderDetails();
    initializePrintFunctionality();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Display order details
function displayOrderDetails() {
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!orderData) {
        showNoOrderMessage();
        return;
    }
    
    // Display customer information
    document.getElementById('customer-name').textContent = orderData.customer.name || 'N/A';
    document.getElementById('customer-phone').textContent = orderData.customer.phone || 'N/A';
    document.getElementById('customer-governorate').textContent = orderData.customer.governorate || 'N/A';
    document.getElementById('customer-address').textContent = orderData.customer.address || 'N/A';
    
    // Show/hide notes if available
    const notesItem = document.getElementById('notes-item');
    if (orderData.customer.notes && orderData.customer.notes.trim()) {
        document.getElementById('customer-notes').textContent = orderData.customer.notes;
        notesItem.style.display = 'flex';
    } else {
        notesItem.style.display = 'none';
    }
    
    // Display order items
    displayOrderItems(orderData.items);
    
    // Display order summary with correct calculations
    displayOrderSummary(orderData);
    
    // Display order ID and date
    document.getElementById('order-id').textContent = orderData.id || 'RO7-000000';
    document.getElementById('order-date').textContent = new Date(orderData.orderDate).toLocaleDateString('en-EG');
    
    // Show success message
    showSuccessMessage('Order confirmed successfully!');
}

// Display order items
function displayOrderItems(items) {
    const orderItemsContainer = document.getElementById('order-items-list');
    
    if (!items || items.length === 0) {
        orderItemsContainer.innerHTML = '<p>No items found</p>';
        return;
    }
    
    orderItemsContainer.innerHTML = '';
    
    items.forEach(item => {
        const orderItem = createOrderItemElement(item);
        orderItemsContainer.appendChild(orderItem);
    });
}

// Create order item element
function createOrderItemElement(item) {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    
    orderItem.innerHTML = `
        <div class="order-item-image">
            <img src="https://via.placeholder.com/60x60/DFBC94/B53324?text=${item.name.split(' ')[0]}" alt="${item.name}">
        </div>
        <div class="order-item-details">
            <h4>${item.name}</h4>
            <p class="order-item-price">EGP ${item.price}</p>
        </div>
        <div class="order-item-quantity">
            Qty: ${item.quantity}
        </div>
        <div class="order-item-total">
            EGP ${(item.price * item.quantity).toFixed(0)}
        </div>
    `;
    
    return orderItem;
}

// Display order summary with correct calculations
function displayOrderSummary(orderData) {
    const items = orderData.items || [];
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Get shipping from order data or calculate based on governorate
    let shipping = orderData.shipping || 30;
    if (!orderData.shipping && orderData.customer.governorate) {
        shipping = calculateShippingForGovernorate(orderData.customer.governorate);
    }
    
    // Get promo code data
    const promoCode = orderData.appliedPromoCode;
    const promoDiscount = orderData.promoDiscount || 0;
    
    // Calculate total
    const total = subtotal + shipping - promoDiscount;
    
    // Update display
    document.getElementById('summary-subtotal').textContent = `EGP ${subtotal.toFixed(0)}`;
    document.getElementById('summary-shipping').textContent = `EGP ${shipping.toFixed(0)}`;
    document.getElementById('summary-governorate').textContent = orderData.customer.governorate || 'Unknown';
    document.getElementById('summary-total').textContent = `EGP ${total.toFixed(0)}`;
    
    // Show/hide discount if applied
    const discountContainer = document.getElementById('summary-discount');
    if (promoDiscount > 0 && promoCode) {
        discountContainer.style.display = 'flex';
        document.getElementById('summary-discount-value').textContent = `-EGP ${promoDiscount.toFixed(0)} (${promoCode})`;
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

// Show no order message
function showNoOrderMessage() {
    const mainContent = document.querySelector('.order-details');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container">
                <div class="no-order-message">
                    <div class="no-order-icon">📋</div>
                    <h2>No Order Found</h2>
                    <p>It seems there's no order to display. Please check your order status or contact support.</p>
                    <a href="index.html" class="btn btn-primary">Return to Home</a>
                </div>
            </div>
        `;
    }
}

// Initialize print functionality
function initializePrintFunctionality() {
    const printBtn = document.getElementById('print-receipt');
    if (printBtn) {
        printBtn.addEventListener('click', printReceipt);
    }
}

// Print receipt
function printReceipt() {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
}

// Generate print content
function generatePrintContent() {
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!orderData) {
        return '<h1>No order data found</h1>';
    }
    
    const items = orderData.items || [];
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = orderData.shipping || 30;
    const promoDiscount = orderData.promoDiscount || 0;
    const total = subtotal + shipping - promoDiscount;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ro7 Art Hub - Order Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 2rem; font-weight: bold; color: #B53324; }
                .order-info { margin-bottom: 30px; }
                .customer-info { margin-bottom: 30px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .items-table th { background-color: #f5f5f5; }
                .summary { text-align: right; }
                .total { font-size: 1.2rem; font-weight: bold; }
                .footer { text-align: center; margin-top: 50px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Ro7 Art Hub</div>
                <h1>Order Receipt</h1>
            </div>
            
            <div class="order-info">
                <h2>Order Information</h2>
                <p><strong>Order ID:</strong> ${orderData.id}</p>
                <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString('en-EG')}</p>
                <p><strong>Status:</strong> ${orderData.status}</p>
            </div>
            
            <div class="customer-info">
                <h2>Customer Information</h2>
                <p><strong>Name:</strong> ${orderData.customer.name}</p>
                <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
                <p><strong>Governorate:</strong> ${orderData.customer.governorate}</p>
                <p><strong>Address:</strong> ${orderData.customer.address}</p>
                ${orderData.customer.notes ? `<p><strong>Notes:</strong> ${orderData.customer.notes}</p>` : ''}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>EGP ${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>EGP ${item.price * item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="summary">
                <p><strong>Subtotal:</strong> EGP ${subtotal.toFixed(0)}</p>
                <p><strong>Shipping:</strong> EGP ${shipping}</p>
                ${promoDiscount > 0 ? `<p><strong>Discount:</strong> -EGP ${promoDiscount.toFixed(0)}</p>` : ''}
                <p class="total"><strong>Total:</strong> EGP ${total.toFixed(0)}</p>
            </div>
            
            <div class="footer">
                <p>Thank you for your order!</p>
                <p>Ro7 Art Hub - Fine Arts Supplies</p>
                <p>Contact: +20 128 354 8248</p>
            </div>
        </body>
        </html>
    `;
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
