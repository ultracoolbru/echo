import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git log',
    description: 'Show Git log',
    async run() {
        console.log('🔧 Running git log...');
        runGitCommand(['log', '-n', '5', '--pretty="format:%h %s (%cr)"'], (output: string) => {
            console.log(output);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
