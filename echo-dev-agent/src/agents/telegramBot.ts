import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { enqueueTask, loadQueue, runTaskQueue, saveQueue } from "../utils/taskQueue";
import { runMultiAgent } from "./multiAgent";

// Token and chat verification
const token = process.env.TELEGRAM_TOKEN!;
const allowedChatId = process.env.TELEGRAM_CHAT_ID!;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/fix (.+)/, (msg, match) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  const task = match?.[1];
  if (task) {
    enqueueTask(task);
    bot.sendMessage(msg.chat.id, `✅ Task queued: "${task}"`);
  }
});

bot.onText(/\/status/, (msg) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  const queue = loadQueue();
  if (queue.length === 0) {
    bot.sendMessage(msg.chat.id, "📭 No tasks in the queue.");
  } else {
    const status = queue.map((t, i) =>
      `${i + 1}. ${t.task} - ${t.status}`
    ).join("\n");
    bot.sendMessage(msg.chat.id, "🧾 Current Queue:\n" + status);
  }
});

bot.onText(/\/cancel (\d+)/, (msg, match) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  const index = parseInt(match?.[1] || "", 10) - 1;
  const queue = loadQueue();
  if (queue[index]) {
    queue[index].status = "cancelled";
    saveQueue(queue);
    bot.sendMessage(msg.chat.id, `❌ Task cancelled: "${queue[index].task}"`);
  } else {
    bot.sendMessage(msg.chat.id, `⚠️ Invalid task number.`);
  }
});

bot.onText(/\/run/, async (msg) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  bot.sendMessage(msg.chat.id, "🚀 Running all pending tasks...");
  await runTaskQueue(runMultiAgent);
  bot.sendMessage(msg.chat.id, "✅ All tasks completed.");
});

bot.onText(/\/help/, (msg) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  const helpText = `
🤖 *Echo Dev Agent Bot Commands*
/fix <task> - Queue a new task
/status - List current task statuses
/cancel <task #> - Cancel a queued task
/run - Run all pending tasks
/help - Show this menu
  `;
  bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
});

console.log("🤖 Telegram bot running...");
