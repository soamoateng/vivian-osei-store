// Client-side Cart & Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------
    // 1. Cart Management
    // ----------------------
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    
    // Initialize cart from Session Storage (for persistence across pages/reloads)
    let cart = JSON.parse(sessionStorage.getItem('shoppingCart')) || [];

    /**
     * Finds the product name from the closest card element.
     * @param {HTMLElement} element - The button element clicked.
     */
    function getProductName(element) {
        // Look for the product name/title in surrounding elements
        const parent = element.closest('.card-body');
        if (parent) {
            const titleElement = parent.querySelector('.card-title, h6, h2');
            if (titleElement) {
                return titleElement.textContent.trim();
            }
        }
        // Fallback for banner items
        if (element.getAttribute('data-name')) {
            return element.getAttribute('data-name');
        }
        return 'Unnamed Product';
    }
    
    /**
     * Adds an item to the cart or increments its quantity.
     */
    function addItemToCart(id, name, price) {
        let existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        saveCart();
        updateCartCount();
        
        // Simple visual feedback
        console.log(`${name} added to cart.`);
        alert(`Added 1x ${name} to cart.`);
    }

    /**
     * Removes an item completely from the cart.
     */
    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
        updateCartCount();
    }

    /**
     * Saves the current cart array to Session Storage.
     */
    function saveCart() {
        sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
    
    /**
     * Updates the number displayed on the shopping cart icon.
     */
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        // Show/hide the badge
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    /**
     * Renders the cart items inside the modal and calculates the total.
     */
    function renderCart() {
        cartItemsList.innerHTML = ''; // Clear previous items
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item text-center text-muted">Cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <div>
                        <strong>${item.name}</strong> 
                        <span class="text-muted small">(₵${item.price.toFixed(2)} x ${item.quantity})</span>
                    </div>
                    <div>
                        <span class="me-3 fw-bold">₵${itemTotal.toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsList.appendChild(li);
            });
        }
        
        cartTotalElement.textContent = `GH₵${total.toFixed(2)}`;
    }

    // --- Event Listeners ---
    
    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            const productPrice = parseFloat(e.target.getAttribute('data-price'));
            const productName = getProductName(e.target); 

            addItemToCart(productId, productName, productPrice);
        });
    });

    // Cart Modal Button
    document.getElementById('cart-button')?.addEventListener('click', () => {
        renderCart();
        cartModal.show();
    });
    
    // Remove Item from Cart (Delegated listener)
    cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const productId = button.getAttribute('data-id');
            removeItem(productId);
        }
    });

    // Checkout Button Simulation
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Checkout simulation: Proceeding to payment. Cart cleared.');
            cart = [];
            saveCart();
            renderCart();
            updateCartCount();
            cartModal.hide();
        } else {
            alert('Your cart is empty!');
        }
    });


    // ----------------------
    // 2. Authentication
    // ----------------------
    
    const role = localStorage.getItem('userRole');

    // ** Dashboard Protection **
    if (document.body.id === 'clerk-dashboard' && role !== 'clerk') {
        alert('Access Denied: Clerk login required.');
        window.location.href = 'login.html';
    }
    
    if (document.body.id === 'owner-dashboard' && role !== 'owner') {
        alert('Access Denied: Owner login required.');
        window.location.href = 'login.html';
    }
    
    // ** Login Simulation Handler **
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const roleInput = document.getElementById('role-select').value;
        
        if (roleInput === 'clerk' || roleInput === 'owner') {
            localStorage.setItem('userRole', roleInput);
            window.location.href = `${roleInput}_dashboard.html`;
        } else {
            alert('Please select a valid role.');
        }
    });
    
    // ** Logout Handler **
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            alert('Logged out successfully.');
            window.location.href = 'index.html';
        });
    });

    // Initialize cart count on load
    updateCartCount(); 
});