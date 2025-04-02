import readline from 'readline';
import chalk from 'chalk';
import { saveTask } from './tasks';

declare global {
  var lastPrompt: string | undefined;
}

globalThis.lastPrompt = 'Create a responsive login page using Mantine in TypeScript';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Task Add Only'));
  console.log(chalk.gray('Type ":task add" or "exit" to quit.'));

  while (true) {
    const input = await askInput('\n> ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (input.trim() === ':task add') {
      if (!globalThis.lastPrompt) {
        console.log(chalk.red('❌ No prompt available to save as task.'));
        continue;
      }

      const title = await askInput('📌 Task title: ');
      try {
        await saveTask(title || globalThis.lastPrompt, globalThis.lastPrompt);
        console.log(chalk.green('✅ Task saved to MongoDB.'));
      } catch (err: any) {
        console.error(chalk.red('❌ Failed to save task:'), err.message);
      }
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":task add" or "exit".'));
    }
  }
})();