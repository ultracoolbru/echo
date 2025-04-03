import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
  name: ':git',
  description: 'Show Git status',
  aliases: [':git status', ':git st'],
  async run() {
    console.log('🔧 Running git status...');
    runGitCommand(['status'], (output: string) => {
      console.log(output);
    });
    console.log(chalk.green('✅ Command Executed.\n'));
  }
};

export default command;
