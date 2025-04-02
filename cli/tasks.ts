import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

console.log('tasks.ts is being loaded');

// Set up error logging to file
const logError = (message: string, error: any) => {
  const errorMsg = `[${new Date().toISOString()}] ${message}: ${error instanceof Error ? error.message : String(error)}\n`;
  fs.appendFileSync('mongodb-errors.log', errorMsg);
  console.error(message, error);
};

// Add uncaught exception handlers
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception in tasks.ts', err);
});

process.on('unhandledRejection', (reason) => {
  logError('Unhandled Rejection in tasks.ts', reason);
});

// Define Task interface for better type safety
export interface Task {
  _id: ObjectId;
  title: string;
  prompt: string;
  status: 'pending' | 'done';
  createdAt: Date;
}

console.log('ensureTaskCollection is being exported');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get MongoDB connection details from environment or use defaults
const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB ?? 'echo';
const collectionName = 'tasks';

// Create a singleton client instance
let clientInstance: MongoClient | null = null;
let collectionInitialized = false;

// Simplified MongoDB client getter
export async function getClient() {
  if (!clientInstance) {
    try {
      clientInstance = new MongoClient(uri);
      await clientInstance.connect();

      // Log connection details to file for debugging
      fs.appendFileSync('mongodb-connection.log',
        `[${new Date().toISOString()}] Connected to MongoDB: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}\n`);
    } catch (err) {
      logError('MongoDB connection error', err);
      clientInstance = null;
      throw err;
    }
  }
  return clientInstance;
}

// Initialize the tasks collection if it doesn't exist
export async function ensureTaskCollection() {
  if (collectionInitialized) return;

  try {
    const client = await getClient();
    const db = client.db(dbName);

    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`Creating '${collectionName}' collection...`);
      await db.createCollection(collectionName);

      // Create an index on createdAt for faster sorting
      await db.collection(collectionName).createIndex({ createdAt: -1 });
      console.log(`Created '${collectionName}' collection with index on createdAt`);
    }

    collectionInitialized = true;
  } catch (err) {
    logError(`Error ensuring '${collectionName}' collection exists`, err);
    throw err;
  }
}

// Save a new task
export async function saveTask(title: string, prompt: string) {
  try {
    await ensureTaskCollection();

    const client = await getClient();
    const db = client.db(dbName);
    const tasks = db.collection(collectionName);

    const task = {
      title,
      prompt,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await tasks.insertOne(task);
    fs.appendFileSync('tasks-log.txt', `[${new Date().toISOString()}] Task saved: ${title}\n`);
    return result;
  } catch (err) {
    logError('Error saving task', err);
    throw err;
  }
}

// List all tasks
export async function listTasks(): Promise<Task[]> {
  console.log('Listing tasks...');
  try {
    await ensureTaskCollection();
    const client = await getClient();
    const db = client.db(dbName);
    const tasks = db.collection<Task>(collectionName);
    return await tasks.find({}).sort({ createdAt: -1 }).toArray();
  } catch (err) {
    logError('Error listing tasks', err);
    // Return empty array instead of throwing to make the function more robust
    return [];
  }
}

// Mark a task as done
export async function markTaskDone(index: number) {
  try {
    await ensureTaskCollection();

    const client = await getClient();
    const db = client.db(dbName);
    const tasks = db.collection(collectionName);

    // Log the operation to file
    fs.appendFileSync('tasks-log.txt', `[${new Date().toISOString()}] Marking task at index ${index} as done\n`);

    const list = await tasks.find({}).sort({ createdAt: -1 }).toArray();

    if (index < 0 || index >= list.length) {
      const error = `Invalid task index: ${index} (valid range: 0-${list.length - 1})`;
      fs.appendFileSync('tasks-log.txt', `[${new Date().toISOString()}] ERROR: ${error}\n`);
      throw new Error(error);
    }

    const task = list[index];

    // Log task data before update
    fs.appendFileSync('tasks-log.txt',
      `[${new Date().toISOString()}] Task to update: ID=${task._id}, Title="${task.title}", Status=${task.status}\n`);

    // Handle possible ObjectId issue
    let taskId;
    try {
      // If it's a string, convert to ObjectId
      if (typeof task._id === 'string') {
        taskId = ObjectId.createFromHexString(task._id as string);
      } else {
        // Otherwise use it directly
        taskId = task._id;
      }
    } catch (err) {
      fs.appendFileSync('tasks-log.txt',
        `[${new Date().toISOString()}] Error with task ID: ${err}\n`);
      // Fall back to searching by title and creation date if ID fails
      const updateResult = await tasks.updateOne(
        { title: task.title, createdAt: task.createdAt },
        { $set: { status: 'done' } }
      );
      fs.appendFileSync('tasks-log.txt',
        `[${new Date().toISOString()}] Fallback update by title: matched=${updateResult.matchedCount}, modified=${updateResult.modifiedCount}\n`);

      if (updateResult.matchedCount > 0) {
        // Success using fallback
        return task;
      }
      throw err;
    }

    const updateResult = await tasks.updateOne(
      { _id: taskId },
      { $set: { status: 'done' } }
    );

    // Log update result
    fs.appendFileSync('tasks-log.txt',
      `[${new Date().toISOString()}] Update result: matched=${updateResult.matchedCount}, modified=${updateResult.modifiedCount}\n`);

    // Return the task regardless of update success (client can check status)
    return task;
  } catch (err) {
    logError('Error marking task as done', err);
    throw err;
  }
}

// Close connection when process exits
process.on('SIGINT', async () => {
  if (clientInstance) {
    try {
      await clientInstance.close();
      fs.appendFileSync('mongodb-connection.log', `[${new Date().toISOString()}] MongoDB connection closed\n`);
    } catch (err) {
      logError('Error closing MongoDB connection', err);
    }
  }
  process.exit(0);
});

// // At the end of the file, add a default export to ensure compatibility
// export default {
//   saveTask,
//   listTasks,
//   markTaskDone
// };