import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git config',
    description: 'Display or set Git configuration settings',
    aliases: [':git config', ':gconfig'],
    async run(args: string[]) {
        console.log(`🔧 Running git config...`);
        runGitCommand(['config', '--list'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
