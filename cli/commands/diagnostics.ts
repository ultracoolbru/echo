import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { EchoCommand } from '../plugin-loader';
import chalk from 'chalk';

// Configure environment
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Basic error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] Unhandled Rejection at: ${promise}\nReason: ${reason}\n\n`);
  console.error('UNHANDLED REJECTION:', reason);
});

// MongoDB connection details
const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB ?? 'echo';

// Force console logs to appear
const originalConsoleLog = console.log;
console.log = (...args) => {
  fs.appendFileSync('console.log', `[${new Date().toISOString()}] ${args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}\n`);
  originalConsoleLog(...args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  fs.appendFileSync('console.log', `[${new Date().toISOString()}] ERROR: ${args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}\n`);
  originalConsoleError(...args);
};

async function diagnoseSystem() {
  console.log('Starting MongoDB connection diagnosis...');
  console.log(`Using URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

  let client: MongoClient | null = null;

  try {
    console.log('Creating new MongoDB client...');
    client = new MongoClient(uri);

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB server');

    console.log('Testing database access...');
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in ${dbName} database:`);

    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }

    // Test tasks collection specifically
    const taskCollection = db.collection('tasks');
    const count = await taskCollection.countDocuments();
    console.log(`Found ${count} documents in tasks collection`);

    if (count > 0) {
      const tasks = await taskCollection.find().limit(5).toArray();
      console.log('Sample task data (first 5 documents):');
      tasks.forEach((task, i) => {
        console.log(`#${i + 1}: ${JSON.stringify({
          id: task._id.toString(),
          title: task.title,
          status: task.status
        })}`);
      });
    }

    console.log('MongoDB diagnosis completed successfully');
  } catch (error) {
    console.error('MongoDB diagnostic error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}


const command: EchoCommand = {
  name: ':diag',
  description: 'Run diagnostics on the system',
  async run(args: string[]) {
      console.log('🔧 Running git merge...');
      diagnoseSystem();
      console.log(chalk.green('✅ Command Executed.\n'));
  }
};

export default command;