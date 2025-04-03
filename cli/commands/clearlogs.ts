import fs from 'fs';
import chalk from 'chalk';

export function clearLogs() {
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