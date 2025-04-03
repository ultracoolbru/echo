import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
  name: ':git branch',
  description: 'Create a new Git branch',
  async run(args: string[]) {
    console.log('🔧 Running git branch...');
    runGitCommand(['branch', args[0]], (output: string) => {
      console.log(output);
        runGitCommand(['checkout', args[0]], (output: string) => {
        console.log(output);
        });
    });
    console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
