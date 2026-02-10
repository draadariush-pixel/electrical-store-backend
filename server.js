require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.8556561209:AAFf3LiluzYRFGrYPDXY_QsAaIOgCwSBBhk; // ⚠️ Token-оо эндээс авна
const CHAT_ID = process.env.2111788794;      // ⚠️ Chat ID-г env болгож байна

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server ажиллаж байна: " + PORT);
});
