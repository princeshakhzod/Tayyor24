document.addEventListener('DOMContentLoaded', function() {
    // Admin login
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        // In a real app, this would check against hashed password in db.json
        if (password === 'admin123') { // Default password for demo
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            loadAdminContent('restaurants');
        } else {
            alert('Notoʻgʻri foydalanuvchi nomi yoki parol');
        }
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-password').value = '';
    });
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadAdminContent(this.getAttribute('data-section'));
        });
    });
    
    // Back buttons
    document.querySelector('.back-to-restaurants')?.addEventListener('click', function() {
        loadAdminContent('restaurants');
    });
    
    document.querySelector('.back-to-orders')?.addEventListener('click', function() {
        loadAdminContent('orders');
    });
    
    // Load admin content based on section
    async function loadAdminContent(section) {
        // Hide all sections first
        document.querySelectorAll('.admin-section').forEach(s => {
            s.style.display = 'none';
        });
        
        // Show the selected section
        document.getElementById(`${section}-section`).style.display = 'block';
        
        // Load content for the section
        switch (section) {
            case 'restaurants':
                await loadRestaurantsList();
                break;
            case 'promo-codes':
                await loadPromoCodesList();
                break;
            case 'orders':
                await loadOrdersList();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
    
    // Load restaurants list
    async function loadRestaurantsList() {
        const restaurants = await API.getRestaurants();
        const restaurantList = document.getElementById('admin-restaurant-list');
        
        restaurantList.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const restaurantElement = document.createElement('div');
            restaurantElement.className = 'admin-restaurant-card';
            restaurantElement.innerHTML = `
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <p>${restaurant.description}</p>
                    <p>Yetkazish narxi: ${restaurant.delivery_price} UZS</p>
                    <p>Manzil: ${restaurant.location}</p>
                </div>
                <div class="restaurant-actions">
                    <button class="edit-restaurant" data-id="${restaurant.id}">Tahrirlash</button>
                    <button class="view-menu" data-id="${restaurant.id}">Menyuni ko'rish</button>
                </div>
            `;
            restaurantList.appendChild(restaurantElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.view-menu').forEach(button => {
            button.addEventListener('click', function() {
                const restaurantId = this.getAttribute('data-id');
                viewRestaurantMenu(restaurantId);
            });
        });
        
        // Add restaurant button
        document.getElementById('add-restaurant-btn').onclick = function() {
            document.getElementById('restaurant-form').style.display = 'block';
        };
        
        // Cancel add restaurant
        document.querySelector('.cancel-btn')?.addEventListener('click', function() {
            document.getElementById('restaurant-form').style.display = 'none';
        });
        
        // Submit new restaurant
        document.getElementById('new-restaurant-form')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const restaurantData = {
                name: document.getElementById('restaurant-name').value,
                description: document.getElementById('restaurant-description').value,
                delivery_price: parseInt(document.getElementById('restaurant-delivery-price').value),
                location: document.getElementById('restaurant-location').value,
                image: document.getElementById('restaurant-image').value
            };
            
            const newRestaurant = await API.addRestaurant(restaurantData);
            if (newRestaurant) {
                alert('Oshxona muvaffaqiyatli qoʻshildi');
                document.getElementById('restaurant-form').style.display = 'none';
                loadRestaurantsList();
            } else {
                alert('Oshxona qoʻshishda xatolik yuz berdi');
            }
        });
    }
    
    // View restaurant menu
    async function viewRestaurantMenu(restaurantId) {
        const restaurant = await API.getRestaurant(restaurantId);
        const menuItems = await API.getMenuItems(restaurantId);
        
        document.getElementById('menu-items-title').textContent = `${restaurant.name} menyusi`;
        document.getElementById('admin-menu-items-list').innerHTML = '';
        
        menuItems.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'admin-menu-item';
            menuItemElement.innerHTML = `
                <div class="menu-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <p>Narxi: ${item.price} UZS</p>
                    <p>Kategoriya: ${item.category}</p>
                </div>
                <div class="menu-item-actions">
                    <button class="edit-menu-item" data-id="${item.id}">Tahrirlash</button>
                </div>
            `;
            document.getElementById('admin-menu-items-list').appendChild(menuItemElement);
        });
        
        // Add menu item button
        document.getElementById('add-menu-item-btn').onclick = function() {
            document.getElementById('menu-item-form').style.display = 'block';
        };
        
        // Cancel add menu item
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            if (btn.closest('#menu-item-form')) {
                btn.addEventListener('click', function() {
                    document.getElementById('menu-item-form').style.display = 'none';
                });
            }
        });
        
        // Submit new menu item
        document.getElementById('new-menu-item-form')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const menuItemData = {
                name: document.getElementById('item-name').value,
                description: document.getElementById('item-description').value,
                price: parseInt(document.getElementById('item-price').value),
                category: document.getElementById('item-category').value,
                image: document.getElementById('item-image').value,
                options: document.getElementById('item-options').value.split('\n').filter(opt => opt.trim() !== '')
            };
            
            const newMenuItem = await API.addMenuItem(restaurantId, menuItemData);
            if (newMenuItem) {
                alert('Taom muvaffaqiyatli qoʻshildi');
                document.getElementById('menu-item-form').style.display = 'none';
                viewRestaurantMenu(restaurantId);
            } else {
                alert('Taom qoʻshishda xatolik yuz berdi');
            }
        });
        
        document.getElementById('restaurants-section').style.display = 'none';
        document.getElementById('menu-items-section').style.display = 'block';
    }
    
    // Load promo codes list
    async function loadPromoCodesList() {
        // In a real app, this would fetch from API
        const promoList = document.getElementById('admin-promo-list');
        promoList.innerHTML = `
            <div class="admin-promo-card">
                <div class="promo-info">
                    <h3>Promo25</h3>
                    <p>Chegirma: 15 000 UZS</p>
                    <p>Minimal buyurtma: 50 000 UZS</p>
                    <p>Amal qilish muddati: 31.12.2025</p>
                </div>
                <div class="promo-actions">
                    <button class="edit-promo">Tahrirlash</button>
                </div>
            </div>
        `;
        
        // Add promo code button
        document.getElementById('add-promo-btn').onclick = function() {
            document.getElementById('promo-form').style.display = 'block';
        };
        
        // Cancel add promo code
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            if (btn.closest('#promo-form')) {
                btn.addEventListener('click', function() {
                    document.getElementById('promo-form').style.display = 'none';
                });
            }
        });
        
        // Submit new promo code
        document.getElementById('new-promo-form')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const promoData = {
                code: document.getElementById('promo-code').value,
                discount: parseInt(document.getElementById('promo-discount').value),
                min_order: parseInt(document.getElementById('promo-min-order').value) || 0,
                expiry: document.getElementById('promo-expiry').value
            };
            
            const newPromo = await API.addPromoCode(promoData);
            if (newPromo) {
                alert('Promo kod muvaffaqiyatli qoʻshildi');
                document.getElementById('promo-form').style.display = 'none';
                loadPromoCodesList();
            } else {
                alert('Promo kod qoʻshishda xatolik yuz berdi');
            }
        });
    }
    
    // Load orders list
    async function loadOrdersList() {
        // In a real app, this would fetch from API
        const ordersList = document.getElementById('admin-orders-list');
        ordersList.innerHTML = `
            <div class="admin-order-card">
                <div class="order-info">
                    <h3>Buyurtma #ORD-123456</h3>
                    <p>Mijoz: John Doe</p>
                    <p>Telefon: +998901234567</p>
                    <p>Manzil: Toshkent shahar</p>
                    <p>Jami: 95 000 UZS</p>
                    <p>Holati: Yangi</p>
                </div>
                <div class="order-actions">
                    <button class="view-order">Batafsil</button>
                </div>
            </div>
        `;
        
        // Add event listener for view order
        document.querySelector('.view-order')?.addEventListener('click', function() {
            viewOrderDetails();
        });
    }
    
    // View order details
    function viewOrderDetails() {
        document.getElementById('admin-order-details').innerHTML = `
            <div class="order-detail">
                <h3>Buyurtma #ORD-123456</h3>
                <p><strong>Mijoz:</strong> John Doe</p>
                <p><strong>Telefon:</strong> +998901234567</p>
                <p><strong>Manzil:</strong> Toshkent shahar, Yunusobod tumani</p>
                <p><strong>Qo'shimcha izoh:</strong> Tezroq yetkazib bering</p>
                <p><strong>To'lov usuli:</strong> Naqd</p>
                <p><strong>Promo kod:</strong> Promo25</p>
                <p><strong>Chegirma:</strong> 15 000 UZS</p>
                <p><strong>Jami:</strong> 95 000 UZS</p>
                <p><strong>Buyurtma vaqti:</strong> 08.06.2025 12:30</p>
            </div>
            <div class="order-items">
                <h4>Buyurtma qilingan mahsulotlar:</h4>
                <ul>
                    <li>Hot dog Efes kebab - 20 000 UZS</li>
                    <li>Zo'rPatir - 78 000 UZS</li>
                </ul>
            </div>
        `;
        
        document.getElementById('orders-section').style.display = 'none';
        document.getElementById('order-details-section').style.display = 'block';
    }
    
    // Load settings
    function loadSettings() {
        // In a real app, this would fetch from API
        document.getElementById('api-key').value = 'tayyor24_apikey_123456';
        document.getElementById('delivery-time').value = '45';
        
        // Generate new API key
        document.getElementById('generate-api-key').addEventListener('click', function() {
            const newKey = 'tayyor24_' + Math.random().toString(36).substring(2, 15);
            document.getElementById('api-key').value = newKey;
        });
        
        // Save settings
        document.getElementById('settings-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Sozlamalar muvaffaqiyatli saqlandi');
        });
    }
});
