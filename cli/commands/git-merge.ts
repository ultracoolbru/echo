import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git merge',
    description: 'Merge a Git branch',
    async run(args: string[]) {
        console.log('🔧 Running git merge...');
        runGitCommand(['merge', args[0]], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
