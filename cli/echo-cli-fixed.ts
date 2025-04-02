#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';
import {
  getStatus,
  getLog,
  getDiff,
  getBranches,
  checkoutBranch,
  commitAll,
  createBranch,
  mergeBranch,
  initRepo,
  pullRemote,
  pushRemote,
  stashChanges,
  showGitConfig
} from './git';

import { saveTask, listTasks, markTaskDone } from './tasks';
import { logConversation, getRecentConversations } from '../data/memory';
import { loadProjectMetadata } from './metadata';
import { askLLM } from './askLLM';

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

    const modelChoice = await ask(chalk.magenta('\n🤖 Use (l)ocal or (r)emote model? [l/r]: '));
    const useRemote = modelChoice.trim().toLowerCase() === 'r';

    const output = await askLLM(systemPrompt, useRemote);
    globalThis.lastPrompt = prompt;
    globalThis.lastEchoOutput = output;
    console.log(chalk.green('\n🧠 Echo Dev Agent:\n') + output);

    await logConversation(prompt, output);

    const saveAnswer = await ask(chalk.yellow('\n💾 Save/edit a file with this code? (y/n): '));
    if (saveAnswer.trim().toLowerCase() !== 'y') return;

    const filePath = await ask(chalk.cyan('📂 Enter file path: '));
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let finalContent = output;

    if (fs.existsSync(absolutePath)) {
      const existing = fs.readFileSync(absolutePath, 'utf8');
      const editMode = await ask('✏️ File exists. (a)ppend, (p)repend, (r)eplace: ');
      finalContent =
        editMode === 'a' ? existing + '\n' + output :
          editMode === 'p' ? output + '\n' + existing :
            output;

      getDiff((res) => console.log(chalk.cyan('\n🔍 Git Diff:\n') + res));
      const confirm = await ask('✅ Apply changes? (y/n): ');
      if (confirm.toLowerCase() !== 'y') return;
    }

    fs.writeFileSync(absolutePath, finalContent);
    globalThis.lastFileSaved = absolutePath;
    console.log(chalk.green(`✅ File saved: ${filePath}`));

    const msg = await ask('✍️ Commit message: ');
    if (!msg.trim()) return console.log(chalk.red('❌ Commit message cannot be empty.'));
    commitAll(msg.trim(), (res) => console.log(chalk.green('\n✅ Git Commit Result:\n') + res));
    console.log(chalk.cyan('🔄 Git status updated.'));

  } catch (err: any) {
    console.error(chalk.red('❌ Dev Agent Error:'), err.message);
  }
}

async function initProjectStructure() {
  const folders = ['src', 'tests', 'docs', 'config'];
  for (const dir of folders) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(chalk.green(`📁 Created ${dir}/`));
    }
  }
  const gitignore = path.resolve('./.gitignore');
  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, 'node_modules\n.env\ndist');
    console.log(chalk.green('📄 Created .gitignore'));
  }
}

function reloadEnv() {
  dotenv.config();
  console.log(chalk.green('🔄 Environment variables reloaded from .env'));
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function endSession() {
  console.log(chalk.yellow('\n👋 Session ended.'));
  rl.close();
  process.exit(0);
}

console.clear();
console.log(chalk.cyan.bold('🤖 Echo CLI – Developer Assistant'));
console.log(chalk.gray('Type commands like :git, :task add, :tasks, :agent, or exit'));
rl.prompt();

rl.on('line', async (input) => {
  const command = input.trim();

  if (command === 'exit') {
    console.log(chalk.yellow('👋 Goodbye.'));
    rl.close();
    process.exit(0);
  }

  if (command === ':git') {
    getStatus((res) => console.log(chalk.cyan('\n🔧 Git Status:\n') + res));
  } else if (command === ':git log') {
    getLog((res) => console.log(chalk.cyan('\n📜 Git Log:\n') + res));
  } else if (command === ':git diff') {
    getDiff((res) => console.log(chalk.cyan('\n🔍 Git Diff:\n') + res));
  } else if (command === ':git branches') {
    getBranches((res) => console.log(chalk.cyan('\n🌿 Git Branches:\n') + res));
  } else if (command === ':git commit') {
    const msg = await ask('✍️ Commit message: ');
    if (!msg.trim()) return console.log(chalk.red('❌ Commit message cannot be empty.'));
    commitAll(msg.trim(), (res) => console.log(chalk.green('\n✅ Git Commit Result:\n') + res));
  } else if (command === ':git init') {
    initRepo((res) => console.log(chalk.green('\n✅ Git Repo Initialized:\n') + res));
  } else if (command === ':git pull') {
    pullRemote((res) => console.log(chalk.green('\n⬇️ Git Pull Result:\n') + res));
  } else if (command === ':git push') {
    pushRemote((res) => console.log(chalk.green('\n⬆️ Git Push Result:\n') + res));
  } else if (command === ':git stash') {
    stashChanges((res) => console.log(chalk.green('\n📦 Git Stash Result:\n') + res));
  } else if (command === ':git config') {
    showGitConfig((res) => console.log(chalk.green('\n⚙️ Git Config:\n') + res));
  } else if (command.startsWith(':git checkout')) {
    const branch = command.split(' ')[2];
    if (!branch) return console.log(chalk.red('❌ Usage: :git checkout <branch>'));
    checkoutBranch(branch, (res) => console.log(chalk.green(`\n✅ Switched to branch: ${branch}\n` + res)));
  } else if (command.startsWith(':git create')) {
    const branch = command.split(' ')[2];
    if (!branch) return console.log(chalk.red('❌ Usage: :git create <branch>'));
    createBranch(branch, (res) => console.log(chalk.green(`\n✅ Created and switched to branch: ${branch}\n` + res)));
  } else if (command.startsWith(':git merge')) {
    const branch = command.split(' ')[2];
    if (!branch) return console.log(chalk.red('❌ Usage: :git merge <branch>'));
    mergeBranch(branch, (res) => console.log(chalk.green(`\n✅ Merged branch: ${branch}\n` + res)));
  } else if (command === ':tasks') {
    const tasks = await listTasks();
    if (!tasks.length) return console.log(chalk.yellow('\n📂 No tasks found.'));
    console.log(chalk.green(`\n📋 ${tasks.length} tasks:`));
    tasks.forEach((task, i) => {
      console.log(`\n#${i + 1} - ${task.title}`);
      console.log(chalk.yellow('  Prompt: ') + task.prompt);
      console.log(chalk.green('  Status: ') + task.status);
    });
  } else if (command === ':task add') {
    const prompt = await ask(chalk.cyan('🧠 Save prompt for task: '));
    await saveTask(prompt, prompt);
    console.log(chalk.green('✅ Task saved.'));
  } else if (command.startsWith(':task done')) {
    const n = parseInt(command.split(' ')[2]);
    if (isNaN(n)) return console.log(chalk.red('❌ Invalid task number.'));
    const task = await markTaskDone(n - 1);
    console.log(chalk.green(`✅ Task "${task.title}" marked as done.`));

  } else if (command === ':agent') {
  rl.pause(); // Pause main CLI input

  // Create fully isolated agent readline interface
  const agentInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log(chalk.magenta('\n🧠 Echo Dev Agent Mode — Ask your questions. Type "exit" to leave.'));

  agentInput.setPrompt('🤖 > ');
  agentInput.prompt();

  agentInput.on('line', async (line) => {
    if (line.trim().toLowerCase() === 'exit') {
      agentInput.close();
      rl.resume();
      rl.prompt();
      return;
    }

    const action = line.trim();
      if (action.toLowerCase() === 'exit') {
        agentInput.close();
        rl.resume();
        rl.prompt();
        return;
      }

      const code = await new Promise<string>((resolve) => {
        agentInput.question('\n📄 Paste code or leave blank:\n> ', resolve);
      });

      await runDevAgent(action, code || undefined);
    agentInput.prompt();
  });

  agentInput.on('close', () => {
    rl.resume();
    rl.prompt();
  });
    (async () => {
      console.clear();
      console.log(chalk.cyan.bold('👨‍💻 Echo Dev Agent – Hybrid LLM Mode (Session)'));
      console.log(chalk.gray('Type your prompt or enter "exit" to quit. Press Ctrl+C anytime.'));

      while (true) {
        const action = await ask('\n🔍 What should Echo do?\n> ');

        if (action.trim().toLowerCase() === 'exit') {
          endSession();
          break;
        }

        const code = await ask('\n📄 Paste code or leave blank:\n> ');
        await runDevAgent(action, code || undefined);
      }
    })();
  } else if (command === ':project init') {
    await initProjectStructure();
    rl.prompt();
  } else if (command === ':env reload') {
    reloadEnv();
    rl.prompt();
  } else {
    console.log(chalk.red('❌ Unknown command.'));
  }

  rl.prompt();
});