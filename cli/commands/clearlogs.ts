import fs from 'fs';
import chalk from 'chalk';
import { EchoCommand } from '../plugin-loader';

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

const command: EchoCommand = {
  name: ':clear',
  description: 'Clear logs',
  aliases: [':clear logs', ':logs clear', ':logs'],
  async run(args: string[]) {
    console.log('🔧 Running command...');
    clearLogs();
    console.log(chalk.green('✅ Command Executed.\n'));
  }
};

export default command;