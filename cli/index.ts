import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { logConversation, getRecentConversations } from '../data/memory';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load Echo profile
const profilePath = path.resolve(__dirname, '../config/echo-profile.json');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

const MODEL = process.env.LLM_MODEL?? 'openchat:latest';

// Send prompt to Ollama
async function askEcho(prompt: string) {
  try {
    const res = await axios.post('http://localhost:11434/api/generate', {
      model: MODEL,
      prompt: `
      You are Echo, an AI assistant built for ${profile.owner.full_name}. Use the following context to help:

      Owner Profile: ${JSON.stringify(profile)}

      Task: ${prompt}

      Respond in a concise and helpful tone, with clear next steps if needed.
      `,
      stream: false
    });

    const response = res.data.response.trim();
    console.log(chalk.green('\nEcho: ') + response);
    return response;
  } catch (err: any) {
    console.error(chalk.red('⚠️ Error communicating with Ollama:'), err.message);
  }
}

// CLI Loop
async function runCLI() {
  console.clear();
  console.log(chalk.cyan.bold('👤 Echo CLI'));
  console.log(chalk.gray('Your digital assistant is ready.\n'));

  while (true) {
    const answer = await input({ message: 'What can I help you with?' });

    const command = answer.trim();

    if (['exit', 'quit'].includes(command.toLowerCase())) {
      console.log(chalk.yellow('👋 Echo signing off...'));
      break;
    }

    const response = await askEcho(command);

    await logConversation(command, response)
  }
}

runCLI();
