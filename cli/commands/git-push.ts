import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git push',
    description: 'Push changes to the remote repository',
    async run(args: string[]) {
        console.log('🔧 Running git push...');
        runGitCommand(['push'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
