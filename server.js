require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(TOKEN, { polling: false });

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

// ⚠️ ЭНЭ ХАМГИЙН ЧУХАЛ
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Server ажиллаж байна: " + PORT);
});
app.get("/", (req, res) => {
  res.send("Electrical Store Backend is running 🚀");
});
const BACKEND_URL = "https://electrical-store-backend.onrender.com";
