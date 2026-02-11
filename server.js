require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

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

// ✅ root endpoint (шалгах зориулалттай)
app.get("/", (req, res) => {
  res.send("Electrical Store Backend is running 🚀");
});

// ✅ Netlify-аас дуудах API (ГОЛ ХЭСЭГ)
app.post("/send-telegram", async (req, res) => {
  const { message, orderId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message хоосон байна" });
  }

  try {
    // Simple ID system for callback_data (Telegram 64 byte limit)
    const shortOrderId = String(orderId).slice(-6); // Last 6 digits of timestamp
    
    await bot.sendMessage(CHAT_ID, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📦 Хүргэлт гарсан", callback_data: `shi_${shortOrderId}` },
            { text: "🚚 Замдаа явж байна", callback_data: `ready_${shortOrderId}` },
            { text: "✅ Захиалга хүргэгдсэн", callback_data: `done_${shortOrderId}` }
          ],
          [
            { text: "❌ Цуцлах", callback_data: `cancel_${shortOrderId}` }
          ]
        ]
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Telegram error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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

  if (data.startsWith("shi_")) {
    statusText = "📦 Хүргэлт гарлаа";
  }
  else if (data.startsWith("ready_")) {
    statusText = "🚚 Захиалга замдаа явж байна";
  }
  else if (data.startsWith("done_")) {
    statusText = "✅ Захиалга амжилттай хүргэгдлээ";
  }
  else if (data.startsWith("cancel_")) {
    statusText = "❌ Захиалга цуцлагдлаа";
  }

  // Telegram дээр хариу илгээх
  await bot.sendMessage(chatId, statusText);

  // Telegram дээр popup хаах
  await bot.answerCallbackQuery(query.id);
});
