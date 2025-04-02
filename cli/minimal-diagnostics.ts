import readline from 'readline';
import chalk from 'chalk';
import { diagnoseMongoConnection } from './diagnostics';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Diagnostics'));
  console.log(chalk.gray('Type ":diagnostics" or "exit" to quit.'));

  while (true) {
    const input = await askInput('\n> ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (input.trim() === ':diagnostics') {
      try {
        await diagnoseMongoConnection();
      } catch (err: any) {
        console.error(chalk.red('❌ Diagnostics failed:'), err.message);
      }
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":diagnostics" or "exit".'));
    }
  }
})();