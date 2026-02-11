require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ CORS (Netlify → Render зөвшөөрөх)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error("❌ TOKEN эсвэл CHAT_ID байхгүй байна!");
}

const bot = new TelegramBot(TOKEN, { polling: false });

// ✅ Захиалгын мэдээлэл хадгалаж буй in-memory database
const orders = {};

// ✅ Random Code Generator (4-6 character)
function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ✅ root endpoint (шалгах зориулалттай)
app.get("/", (req, res) => {
  res.send("Electrical Store Backend is running 🚀");
});

// ✅ Netlify-аас дуудах API (ГОЛ ХЭСЭГ)
app.post("/send-telegram", async (req, res) => {
  const { message, orderId, phone, name, address } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message хоосон байна" });
  }

  try {
    // Generate unique tracking code
    const trackingCode = generateTrackingCode();
    
    // Захиалгын мэдээлэл хадгалах
    orders[trackingCode] = {
      trackingCode: trackingCode,
      orderId: orderId,
      phone: phone,
      name: name,
      address: address,
      status: "pending",
      statusText: "⏳ Сахилж буй",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await bot.sendMessage(CHAT_ID, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📦 Хүргэлт гарсан", callback_data: `shi_${trackingCode}` },
            { text: "🚚 Замдаа явж байна", callback_data: `ready_${trackingCode}` },
            { text: "✅ Захиалга хүргэгдсэн", callback_data: `done_${trackingCode}` }
          ],
          [
            { text: "❌ Цуцлах", callback_data: `cancel_${trackingCode}` }
          ]
        ]
      }
    });
    
    res.json({ success: true, trackingCode });
  } catch (err) {
    console.error("Telegram error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Tracking API - захиалгын статусыг авах (код дээрээс)
app.get("/track/:code", (req, res) => {
  const { code } = req.params;
  const order = orders[code];
  
  if (!order) {
    return res.status(404).json({ success: false, error: "Захиалга олдсонгүй" });
  }
  
  res.json({ 
    success: true, 
    order: {
      trackingCode: order.trackingCode,
      name: order.name,
      address: order.address,
      status: order.status,
      statusText: order.statusText,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  });
});

function getStatusText(status) {
  const statuses = {
    "pending": "⏳ Сахилж буй",
    "shi": "📦 Хүргэлт гарсан",
    "ready": "🚚 Замдаа явж байна",
    "done": "✅ Хүргэгдсэн",
    "cancel": "❌ Цуцлагдсан"
  };
  return statuses[status] || "❓ Үл мэдэгдэх статус";
}

// ✅ Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server ажиллаж байна: " + PORT);
});

bot.on("callback_query", async (query) => {
  const data = query.data; // callback_data
  const chatId = query.message.chat.id;

  console.log("Telegram callback:", data);

  let statusText = "";
  let status = "";

  if (data.startsWith("shi_")) {
    statusText = "📦 Хүргэлт гарлаа";
    status = "shi";
  }
  else if (data.startsWith("ready_")) {
    statusText = "🚚 Захиалга замдаа явж байна";
    status = "ready";
  }
  else if (data.startsWith("done_")) {
    statusText = "✅ Захиалга амжилттай хүргэгдлээ";
    status = "done";
  }
  else if (data.startsWith("cancel_")) {
    statusText = "❌ Захиалга цуцлагдлаа";
    status = "cancel";
  }

  // Захиалгын код авах
  const trackingCode = data.split("_")[1];
  if (orders[trackingCode]) {
    orders[trackingCode].status = status;
    orders[trackingCode].statusText = getStatusText(status);
    orders[trackingCode].updatedAt = new Date().toISOString();
  }

  // Telegram дээр хариу илгээх
  await bot.sendMessage(chatId, statusText);

  // Telegram дээр popup хаах
  await bot.answerCallbackQuery(query.id);
});
