import readline from 'readline';
import chalk from 'chalk';
import { markTaskDone } from './tasks';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Mark Task Done'));
  console.log(chalk.gray('Type ":task done <number>" or "exit" to quit.'));

  while (true) {
    const input = await askInput('\n> ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (input.trim().startsWith(':task done')) {
      const parts = input.trim().split(' ');
      const index = parseInt(parts[2]) - 1;

      if (isNaN(index)) {
        console.log(chalk.red('❌ Invalid task number. Use ":task done <number>".'));
        continue;
      }

      try {
        const task = await markTaskDone(index);
        console.log(chalk.green(`✅ Marked task "${task.title}" as done.`));
      } catch (err: any) {
        console.error(chalk.red('❌ Failed to mark task as done:'), err.message);
      }
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":task done <number>" or "exit".'));
    }
  }
})();