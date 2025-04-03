import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
  name: ':git commit',
  description: 'Perform a Git commit',
  async run(args: string[]) {
    console.log('🔧 Running git commit...');
    runGitCommand(['commit', '-m', args[0]], (output: string) => {
      console.log(output);
    });
    console.log(chalk.green('✅ Command Executed.\n'));
  }
};

export default command;
