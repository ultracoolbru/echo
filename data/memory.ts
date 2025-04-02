import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const DB_NAME = 'echo';

let client: MongoClient;

export async function connectDB() {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('[DB] Connected to MongoDB');
    }
    return client.db(DB_NAME);
}

// Save conversation
export async function logConversation(input: string, output: string) {
    const db = await connectDB();
    await db.collection('conversations').insertOne({
        timestamp: new Date(),
        input,
        output
    });
}

// Fetch latest messages
export async function getRecentConversations(limit = 5) {
    const db = await connectDB();
    return db.collection('conversations')
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}
