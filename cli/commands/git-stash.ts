import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git stash',
    description: 'Stash git changes',
    aliases: [':git stash', ':gstash'],
    async run(args: string[]) {
        console.log('🔧 Running git stash...');
        runGitCommand(['stash'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
