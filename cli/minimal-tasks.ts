import readline from 'readline';
import chalk from 'chalk';
import { listTasks } from './tasks';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Task Viewer'));
  console.log(chalk.gray('Type ":tasks" or "exit" to quit.'));

  while (true) {
    const input = await askInput('\n> ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (input.trim() === ':tasks') {
      try {
        const tasks = await listTasks();
        if (tasks.length === 0) {
          console.log(chalk.gray('\n📂 No tasks found.'));
        } else {
          console.log(chalk.green(`\n📋 ${tasks.length} tasks:`));
          tasks.forEach((task, i) => {
            console.log(`\n#${i + 1}: ${task.title}`);
            console.log(chalk.yellow('  Prompt: ') + task.prompt);
            console.log(chalk.green('  Status: ') + task.status);
          });
        }
      } catch (err: any) {
        console.error(chalk.red('❌ Failed to list tasks:'), err.message);
      }
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":tasks" or "exit".'));
    }
  }
})();