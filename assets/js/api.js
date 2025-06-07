const API = {
    BASE_URL: 'http://localhost:8000/api',
    
    // Restoranlar
    getRestaurants: async function() {
        const response = await fetch(`${this.BASE_URL}/restaurants`);
        return await response.json();
    },
    
    addRestaurant: async function(restaurantData) {
        const response = await fetch(`${this.BASE_URL}/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(restaurantData)
        });
        return await response.json();
    },
    
    // Buyurtmalar
    placeOrder: async function(orderData) {
        const response = await fetch(`${this.BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }
};

// Initialize API
document.addEventListener('DOMContentLoaded', () => {
    console.log("API initialized");
});