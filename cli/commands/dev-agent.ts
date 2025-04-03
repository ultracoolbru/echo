import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { EchoCommand } from '../plugin-loader';

import { rl, ask } from '../common';
import { askLLM } from '../askLLM';
import { loadProjectMetadata } from '../metadata';
import { getDiff, commitAll } from './git';
import { logConversation, getRecentConversations } from '../../data/memory';

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

function startAgent() {
  (async () => {
    console.clear();
    console.log(chalk.cyan.bold('👨‍💻 Echo Dev Agent – Hybrid LLM Mode (Session)'));
    console.log(chalk.gray('Type your prompt or enter "exit" to quit. Press Ctrl+C anytime.'));

    while (true) {
      console.log('\n🔍 What should Echo do?');
      const action = await ask('> ');

      if (action.trim().toLowerCase() === 'exit') {
        endSession();
        break;
      }

      const code = await ask('\n📄 Paste code or leave blank:\n> ');
      await runDevAgent(action, code || undefined);
    }
  })();
}

const command: EchoCommand = {
  name: ':agent',
  description: 'Start Echo Dev Agent session',
  async run() {
    startAgent();
  }
};

export default command;

function endSession() {
  console.log(chalk.yellow('\n👋 Session ended.'));
  rl.close();
  process.exit(0);
}