import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git pull',
    description: 'Pull changes from the remote repository',
    aliases: [':git pull', ':gpull'],
    async run(args: string[]) {
        console.log('🔧 Running git pull...');
        runGitCommand(['pull'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
