import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git init',
    description: 'Initialize a new Git repository',
    aliases: [':git init', ':gi'],
    async run(args: string[]) {
        console.log('🔧 Running git init...');
        runGitCommand(['init'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
