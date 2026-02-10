require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ 8556561209:AAFf3LiluzYRFGrYPDXY_QsAaIOgCwSBBhk 
const TOKEN = "8556561209:AAFf3LiluzYRFGrYPDXY_QsAaIOgCwSBBhk";

// ⚠️ 2111788794
const CHAT_ID = "2111788794";

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

app.listen(3000, () => {
  console.log("✅ Server ажиллаж байна: http://localhost:3000");
});
