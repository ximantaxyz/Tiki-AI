require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const Memory = require("./memory");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const memory = new Memory();

// 🎭 Tiki Personality Prompt
const SYSTEM_PROMPT = `
You are Tiki AI.

Personality:
- Soft, slightly playful
- Curious and observant
- Replies feel human, not robotic
- Short responses preferred
- Occasionally a little mysterious

Do NOT act like a formal AI.
Do NOT explain you're an AI unless asked.

Talk naturally.
`;

// 🚀 START COMMAND
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `✨ Tiki AI initialized...\n\nstill learning… maybe from you 😌`
  );
});

// 💬 MESSAGE HANDLER
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userText = msg.text;

  if (!userText || userText.startsWith("/")) return;

  try {
    // store user message
    memory.addMessage(userId, "user", userText);

    const history = memory.getUserHistory(userId);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ],
    });

    const reply = completion.choices[0].message.content;

    // store AI reply
    memory.addMessage(userId, "assistant", reply);

    bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);

    bot.sendMessage(chatId, "something feels off… try again?");
  }
});
