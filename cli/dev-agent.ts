import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

import { rl, askInput } from './common';
import { askLLM } from './askLLM';
import { loadProjectMetadata } from './metadata';
import { showDiff, gitCommit } from './git';
import { logConversation, getRecentConversations } from '../data/memory';
import { ensureTaskCollection, getClient, listTasks, Task, saveTask, markTaskDone } from './tasks';
import { diagnoseMongoConnection } from './diagnostics';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Extend globalThis to include custom properties
declare global {
  var lastPrompt: string | undefined;
  var lastEchoOutput: string | undefined;
  var lastFileSaved: string | undefined;
}

async function runDevAgent(prompt: string, codeSnippet?: string) {
  try {
    const project = await loadProjectMetadata();
    const memory = await getRecentConversations(3);
    const memoryContext = memory.map(m => `User: ${m.input}\nEcho: ${m.output}`).join('\n');

    const systemPrompt = `
    You are Echo Dev Agent, an AI developer working on the following project:

    Project Context:
    ${project ? JSON.stringify(project, null, 2) : 'No project metadata found.'}

    Memory Log:
    ${memoryContext || 'No recent interactions available.'}

    Instructions:
    - Always follow the project stack and style
    - Use best practices for ${project?.language || 'TypeScript'}
    - Format output as clean, modular code

    User Task:
    ${prompt}

    ${codeSnippet ? `\nCode Input:\n${codeSnippet}` : ''}
    `;

    const modelChoice = await askInput(chalk.magenta('\n🤖 Use (l)ocal or (r)emote model? [l/r]: '));
    const useRemote = modelChoice.trim().toLowerCase() === 'r';

    const output = await askLLM(systemPrompt, useRemote);
    globalThis.lastPrompt = prompt;
    globalThis.lastEchoOutput = output;
    console.log(chalk.green('\n🧠 Echo Dev Agent:\n') + output);

    await logConversation(prompt, output);

    const saveAnswer = await askInput(chalk.yellow('\n💾 Save/edit a file with this code? (y/n): '));
    if (saveAnswer.trim().toLowerCase() !== 'y') return;

    const filePath = await askInput(chalk.cyan('📂 Enter file path: '));
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let finalContent = output;

    if (fs.existsSync(absolutePath)) {
      const existing = fs.readFileSync(absolutePath, 'utf8');
      const editMode = await askInput('✏️ File exists. (a)ppend, (p)repend, (r)eplace: ');
      finalContent =
        editMode === 'a' ? existing + '\n' + output :
          editMode === 'p' ? output + '\n' + existing :
            output;

      showDiff(existing, finalContent);
      const confirm = await askInput('✅ Apply changes? (y/n): ');
      if (confirm.toLowerCase() !== 'y') return;
    }

    fs.writeFileSync(absolutePath, finalContent);
    globalThis.lastFileSaved = absolutePath;
    console.log(chalk.green(`✅ File saved: ${filePath}`));

    await gitCommit(absolutePath, useRemote);
    console.log(chalk.cyan('🔄 Git status updated.'));

  } catch (err: any) {
    console.error(chalk.red('❌ Dev Agent Error:'), err.message);
  }
}

// Add a function to clear logs
function clearLogs() {
  const logFiles = ['mongodb-errors.log', 'tasks-log.txt', 'mongodb-connection.log', 'console.log'];
  logFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(chalk.green(`✅ Cleared log file: ${file}`));
    } else {
      console.log(chalk.yellow(`⚠️ Log file not found: ${file}`));
    }
  });
}

// Add a function to run diagnostics
async function runDiagnostics() {
  // Run diagnostics
  diagnoseMongoConnection().then(() => {
    console.log('Diagnostics completed');
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal error in diagnostics:', err);
    process.exit(1);
  });


  // console.log(chalk.cyan('\n🔍 Running system diagnostics...'));
  // try {
  //   const { MongoClient } = await import('mongodb');
  //   const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
  //   const dbName = process.env.MONGODB_DB ?? 'echo';

  //   console.log(chalk.yellow('Testing MongoDB connection...'));
  //   const client = new MongoClient(uri);
  //   await client.connect();
  //   console.log(chalk.green('✓ Connected to MongoDB server'));

  //   const db = client.db(dbName);
  //   const collections = await db.listCollections().toArray();
  //   console.log(chalk.green(`✓ Access to database verified. Found ${collections.length} collections:`));
  //   collections.forEach(c => console.log(`  - ${c.name}`));

  //   if (collections.some(c => c.name === 'tasks')) {
  //     const tasksColl = db.collection('tasks');
  //     const count = await tasksColl.countDocuments();
  //     console.log(chalk.green(`✓ Tasks collection exists with ${count} documents`));

  //     if (count > 0) {
  //       const tasks = await tasksColl.find().sort({ createdAt: -1 }).limit(3).toArray();
  //       console.log(chalk.cyan('\nSample tasks:'));
  //       tasks.forEach((task, idx) => {
  //         console.log(`Task #${idx + 1}:`);
  //         console.log(`  ID: ${task._id}`);
  //         console.log(`  Title: ${task.title}`);
  //         console.log(`  Status: ${task.status}`);
  //       });
  //     }
  //   } else {
  //     console.log(chalk.yellow('! Tasks collection does not exist yet'));
  //   }

  //   await client.close();
  //   console.log(chalk.green('✓ MongoDB connection closed properly'));
  // } catch (err) {
  //   console.error(chalk.red('❌ Diagnostic error:'), err instanceof Error ? err.message : String(err));
  // }
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('👨‍💻 Echo Dev Agent – Hybrid LLM Mode (Session)'));
  console.log(chalk.gray('Type your prompt or enter "exit" to quit. Press Ctrl+C anytime.'));

  while (true) {
    const action = await askInput('\n🔍 What should Echo do?\n> ');

    if (action.trim().toLowerCase() === 'exit') {
      endSession();
      break;
    }

    if (action.startsWith(':')) {
      await handleInternalCommand(action);
      continue;
    }

    const code = await askInput('\n📄 Paste code or leave blank:\n> ');
    await runDevAgent(action, code || undefined);
  }
})();

function endSession() {
  console.log(chalk.yellow('\n👋 Session ended.'));
  rl.close();
  process.exit(0);
}

async function handleInternalCommand(action: string) {
  const command = action.slice(1).trim().toLowerCase();

  switch (command) {
    case 'task':
      await handleTaskCommand(action);
      break;
    case 'tasks':
      await listAllTasks();
      break;
    case 'diagnostics':
      await runDiagnostics();
      break;
    case 'clearlogs':
      clearLogs();
      break;
    case 'help':
      showHelpMenu();
      break;
    default:
      console.log(chalk.red(`\n❌ Unknown command: :${command}`));
      break;
  }
}

async function handleTaskCommand(action: string) {
  const taskSub = action.split(' ').slice(1);
  if (!taskSub.length) {
    console.log(chalk.red('\n❌ Usage: :task add OR :task done <number>'));
    return;
  }
  if (taskSub[0] === 'add') {
    await addTask();
  } else if (taskSub[0] === 'done' && taskSub[1]) {
    await markTaskAsDone(taskSub[1]);
  }
}

async function addTask() {
  if (!globalThis.lastPrompt) {
    console.log(chalk.red('\n❌ No prompt to save as a task.'));
    return;
  }
  const title = await askInput(chalk.cyan('📌 Task title: '));
  try {
    await saveTask(title || globalThis.lastPrompt, globalThis.lastPrompt);
    console.log(chalk.green('✅ Task saved to MongoDB.'));
  } catch (e) {
    console.error(chalk.red('❌ Failed to save task:'), e instanceof Error ? e.message : String(e));
  }
}

async function markTaskAsDone(taskNumberStr: string) {
  const taskNumber = parseInt(taskNumberStr);
  if (isNaN(taskNumber)) {
    console.log(chalk.red('❌ Invalid task number. Must be a number.'));
    return;
  }
  const index = taskNumber - 1;
  try {
    const doneTask = await markTaskDone(index);
    console.log(chalk.green(`✅ Task "${doneTask.title}" marked as done.`));
  } catch (e) {
    console.error(chalk.red('❌ Failed to mark task as done:'), e instanceof Error ? e.message : String(e));
  }
}

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB ?? 'echo';
const collectionName = 'tasks';

async function listAllTasks() {
  try {
    // console.log(chalk.cyan('🔍 Fetching tasks...'));
    // const tasks = await listTasks();
    // if (!tasks || tasks.length === 0) {
    //   console.log(chalk.gray('\n📂 No tasks found.'));
    // } else {
    //   console.log(chalk.green(`\n📋 ${tasks.length} tasks:`));
    //   tasks.forEach((task, index) => {
    //     console.log(`\n#${index + 1} - ${task.title}`);
    //     console.log(chalk.yellow('  Prompt: ') + task.prompt);
    //     console.log(chalk.green('  Status: ') + task.status);
    //   });
    // }
    console.log('Listing tasks...');
      try {
        await ensureTaskCollection();
        const client = await getClient();
        const db = client.db(dbName);
        const tasks = db.collection<Task>(collectionName);
        return await tasks.find({}).sort({ createdAt: -1 }).toArray();
      } catch (err) {
        console.log('Error listing tasks', err);
        // Return empty array instead of throwing to make the function more robust
        return [];
      }
  } catch (e) {
    console.error(chalk.red('\n❌ Failed to load tasks:'), e instanceof Error ? e.message : String(e));
  }
}

function showHelpMenu() {
  console.log(chalk.cyan('\n🔧 Available Echo Commands:'));
  console.log(':help       - Show this help menu');
  console.log(':task add   - Save last prompt as a task');
  console.log(':task done <number> - Mark task as done');
  console.log(':tasks      - List all tasks in MongoDB');
  console.log(':diagnostics - Run MongoDB diagnostics');
  console.log(':clearlogs  - Clear all log files');
  console.log(':git        - Show Git status');
  console.log('exit        - Exit Echo session');
}