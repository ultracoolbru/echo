import cron from 'node-cron';
import { connectDB, getRecentConversations } from '../data/memory';
import fs from 'fs';
import path from 'path';

// Load Echo Profile
const profilePath = path.resolve(__dirname, '../config/echo-profile.json');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

// Log to system_logs
async function logSystemAction(type: string, message: string) {
    const db = await connectDB();
    await db.collection('system_logs').insertOne({
        timestamp: new Date(),
        type,
        message
    });
}

// Morning Summary Task
cron.schedule('0 7 * * *', async () => {
    const conversations = await getRecentConversations(3);

    const summary = `
🌞 Good Morning! Here's your Echo Summary:
    - Latest tasks or chats:
    ${conversations.map(c => `• ${c.input} → ${c.output.substring(0, 60)}...`).join('\n')}

    Tip: Use "echo what should I focus on today?" to start your day.
    `.trim();

    console.log('\n' + summary + '\n');
    await logSystemAction('daily_summary', summary);
});

// Evening Review Task
cron.schedule('0 21 * * *', async () => {
    const conversations = await getRecentConversations(5);

    const review = `
    🌙 Evening Wrap-up:
    You interacted with Echo today on the following topics:
    ${conversations.map(c => `• ${c.input}`).join('\n')}

    Consider setting up tasks for tomorrow!
  `.trim();

    console.log('\n' + review + '\n');
    await logSystemAction('evening_review', review);
});

console.log('⏰ Echo Scheduler running...');
