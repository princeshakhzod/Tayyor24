const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'db.json');

// Ma'lumotlarni o'qish
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Ma'lumotlarni yozish
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// REST API endpoints
app.get('/api/restaurants', (req, res) => {
  const data = readData();
  res.json(data.restaurants);
});

app.post('/api/restaurants', (req, res) => {
  const data = readData();
  const newRestaurant = {
    id: data.restaurants.length + 1,
    ...req.body,
    menu: []
  };
  data.restaurants.push(newRestaurant);
  writeData(data);
  res.json(newRestaurant);
});

app.post('/api/orders', (req, res) => {
  const data = readData();
  const newOrder = {
    id: data.orders.length + 1,
    ...req.body,
    status: "new",
    date: new Date().toISOString(),
    order_number: `ORD-${Date.now()}`
  };
  data.orders.push(newOrder);
  writeData(data);
  
  // Bu yerda telegram botga xabar yuborish kodi bo'lishi kerak
  console.log("Yangi buyurtma:", newOrder);
  
  res.json(newOrder);
});

// Frontend fayllarini yetkazib berish
app.use(express.static(path.join(__dirname)));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishga tushdi`);
});

const TelegramBot = require('node-telegram-bot-api');

// Telegram bot tokenini qo'ying
const TOKEN = '7809095245:AAH0Qri_kK55yHWFFHYuQJUfw801lSjzVI8';
const CHAT_ID = '6125606244';

const bot = new TelegramBot(TOKEN, {polling: false});

// Buyurtma endpointiga qo'shing
app.post('/api/orders', (req, res) => {
  // ... avvalgi kod
  
  // Telegramga xabar yuborish
  const message = `📦 Yangi buyurtma!\n\nMijoz: ${newOrder.customer_name}\nTelefon: ${newOrder.customer_phone}\nManzil: ${newOrder.delivery_address}\nJami: ${newOrder.total} UZS`;
  
  bot.sendMessage(CHAT_ID, message)
    .then(() => console.log("Xabar yuborildi"))
    .catch(err => console.error("Xabar yuborishda xato:", err));
    
  res.json(newOrder);
});