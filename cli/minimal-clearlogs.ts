import fs from 'fs';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function clearLogs() {
  const logFiles = [
    'mongodb-errors.log',
    'tasks-log.txt',
    'mongodb-connection.log',
    'console.log'
  ];

  console.log('\n🧹 Checking and clearing logs...');
  logFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(chalk.green(`✅ Cleared log file: ${file}`));
    } else {
      console.log(chalk.yellow(`⚠️ Log file not found: ${file}`));
    }
  });
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Clear Logs'));
  console.log(chalk.gray('Type ":clearlogs" or "exit" to quit.'));

  while (true) {
    const input = await askInput('\n> ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (input.trim() === ':clearlogs') {
      clearLogs();
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":clearlogs" or "exit".'));
    }
  }
})();