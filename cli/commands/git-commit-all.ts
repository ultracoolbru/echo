import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git commit all',
    description: 'Perform a Git commit all',
    aliases: [':gca'],
    async run(args: string[]) {
        console.log('🔧 Running git commit all...');
        runGitCommand(['add', '.'], (output: string) => {
            console.log(output);
            runGitCommand(['commit', '-m', args[0]], (output: string) => {
                console.log(output);
            });
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
