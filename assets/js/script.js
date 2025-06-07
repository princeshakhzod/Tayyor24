document.addEventListener('DOMContentLoaded', function() {
    // Show loading animation for 2 seconds
    setTimeout(() => {
        document.querySelector('.loading-screen').style.display = 'none';
        document.querySelector('.app-container').style.display = 'block';
        loadRestaurants();
    }, 2000);
    
    // Navigation variables
    let currentView = 'restaurants';
    let currentRestaurantId = null;
    let currentMenuItemId = null;
    let cartItems = [];
    
    // Back button functionality
    document.querySelector('.back-btn').addEventListener('click', function() {
        navigateBack();
    });
    
    // Shopping cart functionality
    document.querySelector('.checkout-btn').addEventListener('click', function() {
        showCheckoutForm();
    });
    
    // Return home from confirmation
    document.querySelector('.return-home').addEventListener('click', function() {
        resetToHome();
    });
    
    // Order form submission
    document.querySelector('#order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
    
    // Apply promo code
    document.querySelector('#apply-promo').addEventListener('click', function() {
        applyPromoCode();
    });
    
    // Load restaurants from API
    async function loadRestaurants() {
        const restaurants = await API.getRestaurants();
        const restaurantList = document.getElementById('restaurant-list');
        
        restaurantList.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const restaurantElement = document.createElement('div');
            restaurantElement.className = 'restaurant-card';
            restaurantElement.innerHTML = `
                <h3>${restaurant.name}</h3>
                <p>${restaurant.description}</p>
                <p class="delivery-price">Yetkazish narxi: ${restaurant.delivery_price} UZS</p>
            `;
            restaurantElement.addEventListener('click', () => {
                showRestaurantMenu(restaurant.id);
            });
            restaurantList.appendChild(restaurantElement);
        });
    }
    
    // Show restaurant menu
    async function showRestaurantMenu(restaurantId) {
        currentRestaurantId = restaurantId;
        currentView = 'menu';
        
        const restaurant = await API.getRestaurant(restaurantId);
        const menuItems = await API.getMenuItems(restaurantId);
        
        document.getElementById('restaurant-name').textContent = restaurant.name;
        document.getElementById('restaurant-description').textContent = restaurant.description;
        document.getElementById('delivery-price').textContent = restaurant.delivery_price + ' UZS';
        
        const menuItemsContainer = document.getElementById('menu-items');
        menuItemsContainer.innerHTML = '';
        
        menuItems.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p class="item-price">${item.price} UZS</p>
            `;
            menuItemElement.addEventListener('click', () => {
                showMenuItemDetails(restaurantId, item.id);
            });
            menuItemsContainer.appendChild(menuItemElement);
        });
        
        document.getElementById('restaurant-list').style.display = 'none';
        document.getElementById('restaurant-menu').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'block';
        document.querySelector('.back-btn').onclick = () => {
            document.getElementById('restaurant-menu').style.display = 'none';
            document.getElementById('restaurant-list').style.display = 'block';
            document.querySelector('.back-btn').style.display = 'none';
            currentView = 'restaurants';
        };
    }
    
    // Show menu item details
    async function showMenuItemDetails(restaurantId, itemId) {
        currentMenuItemId = itemId;
        currentView = 'item-details';
        
        const menuItem = await API.getMenuItem(restaurantId, itemId);
        
        document.getElementById('food-name').textContent = menuItem.name;
        document.getElementById('food-price').textContent = menuItem.price + ' UZS';
        
        const optionsContainer = document.getElementById('food-options');
        optionsContainer.innerHTML = '';
        
        if (menuItem.options && menuItem.options.length > 0) {
            menuItem.options.forEach(option => {
                const optionElement = document.createElement('label');
                optionElement.className = 'food-option';
                optionElement.innerHTML = `
                    <input type="radio" name="food-option" value="${option}">
                    ${option}
                `;
                optionsContainer.appendChild(optionElement);
            });
        }
        
        document.getElementById('restaurant-menu').style.display = 'none';
        document.getElementById('food-details').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'block';
        document.querySelector('.back-btn').onclick = () => {
            document.getElementById('food-details').style.display = 'none';
            document.getElementById('restaurant-menu').style.display = 'block';
            currentView = 'menu';
        };
        
        // Add to cart button functionality
        document.querySelector('.add-to-cart').onclick = () => {
            const selectedOption = document.querySelector('input[name="food-option"]:checked');
            addToCart(menuItem, selectedOption ? selectedOption.value : null);
        };
    }
    
    // Add item to cart
    function addToCart(menuItem, option) {
        cartItems.push({
            restaurantId: currentRestaurantId,
            itemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            option: option,
            quantity: 1
        });
        
        updateCartDisplay();
        showCart();
    }
    
    // Show shopping cart
    function showCart() {
        currentView = 'cart';
        
        document.getElementById('food-details').style.display = 'none';
        document.getElementById('restaurant-menu').style.display = 'none';
        document.getElementById('shopping-cart').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'block';
        document.querySelector('.back-btn').onclick = () => {
            document.getElementById('shopping-cart').style.display = 'none';
            document.getElementById('restaurant-menu').style.display = 'block';
            currentView = 'menu';
        };
    }
    
    // Update cart display
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        
        cartItems.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.option ? `<p>${item.option}</p>` : ''}
                    <p class="item-price">${item.price} UZS</p>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
            
            total += item.price;
        });
        
        // Update totals
        document.getElementById('item-count').textContent = `${cartItems.length} Mahsulotlar`;
        document.getElementById('total-amount').textContent = `${total} UZS`;
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cartItems.splice(index, 1);
                updateCartDisplay();
            });
        });
    }
    
    // Apply promo code
    function applyPromoCode() {
        const promoCode = document.getElementById('promo-input').value;
        const total = calculateCartTotal();
        
        // In a real app, this would check against the API
        if (promoCode === 'Promo25' && total >= 50000) {
            const discount = 15000;
            document.getElementById('discount-section').style.display = 'block';
            document.getElementById('discount-amount').textContent = `${discount} UZS`;
            document.getElementById('total-amount').textContent = `${total - discount} UZS`;
        } else {
            alert('Promo kod notoʻgʻri yoki minimal buyurtma miqdori yetarli emas');
        }
    }
    
    // Calculate cart total
    function calculateCartTotal() {
        return cartItems.reduce((sum, item) => sum + item.price, 0);
    }
    
    // Show checkout form
    function showCheckoutForm() {
        currentView = 'checkout';
        
        document.getElementById('shopping-cart').style.display = 'none';
        document.getElementById('checkout-form').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'block';
        document.querySelector('.back-btn').onclick = () => {
            document.getElementById('checkout-form').style.display = 'none';
            document.getElementById('shopping-cart').style.display = 'block';
            currentView = 'cart';
        };
    }
    
    // Submit order
    async function submitOrder() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const notes = document.getElementById('notes').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const promoCode = document.getElementById('promo-input').value;
        
        const orderData = {
            customer_name: name,
            customer_phone: phone,
            delivery_address: address,
            notes: notes,
            payment_method: paymentMethod,
            promo_code: promoCode,
            items: cartItems,
            total: calculateCartTotal(),
            restaurant_id: currentRestaurantId
        };
        
        const order = await API.placeOrder(orderData);
        
        if (order) {
            showOrderConfirmation(order);
        } else {
            alert('Buyurtma berishda xatolik yuz berdi. Iltimos, qayta urinib koʻring.');
        }
    }
    
    // Show order confirmation
    function showOrderConfirmation(order) {
        currentView = 'confirmation';
        
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('order-confirmation').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'none';
        
        document.getElementById('order-number').textContent = order.order_number;
        document.getElementById('delivery-time').textContent = '45 daqiqa';
    }
    
    // Reset to home screen
    function resetToHome() {
        cartItems = [];
        currentView = 'restaurants';
        
        document.getElementById('order-confirmation').style.display = 'none';
        document.getElementById('restaurant-list').style.display = 'block';
        document.querySelector('.back-btn').style.display = 'none';
        
        loadRestaurants();
    }
    
    // Navigation back
    function navigateBack() {
        switch (currentView) {
            case 'menu':
                document.getElementById('restaurant-menu').style.display = 'none';
                document.getElementById('restaurant-list').style.display = 'block';
                document.querySelector('.back-btn').style.display = 'none';
                currentView = 'restaurants';
                break;
            case 'item-details':
                document.getElementById('food-details').style.display = 'none';
                document.getElementById('restaurant-menu').style.display = 'block';
                currentView = 'menu';
                break;
            case 'cart':
                document.getElementById('shopping-cart').style.display = 'none';
                document.getElementById('restaurant-menu').style.display = 'block';
                currentView = 'menu';
                break;
            case 'checkout':
                document.getElementById('checkout-form').style.display = 'none';
                document.getElementById('shopping-cart').style.display = 'block';
                currentView = 'cart';
                break;
        }
    }
});