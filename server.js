require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// .env-ээс токен уншина
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(TOKEN, { polling: false });
const PORT = process.env.PORT || 3000;

// POST хүсэлт хүлээн авах эцсийн цэг
app.post("/send", async (req, res) => {
  const text = req.body.text;

  try {
    await bot.sendMessage(CHAT_ID, text);
    res.json({ success: true });
  } catch (err) {
    console.error("Telegram error:", err);
    res.json({ success: false, error: err.message });
  }
});

// ⚠️ PORT заавал ингэж бичнэ
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Server ажиллаж байна: " + PORT);
});
