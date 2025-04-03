import { EchoCommand } from '../plugin-loader';
import { runGitCommand } from './git';
import chalk from 'chalk';

const command: EchoCommand = {
    name: ':git checkout',
    description: 'Checkout a Git branch',
    async run(args: string[]) {
        const branch = args[0];
        if (!branch) {
            console.log(chalk.red('❌ Usage: :git checkout <branch>'));
            return;
        }

        console.log(`🔧 Checking out branch '${branch}'...`);
        runGitCommand(['checkout', branch], (output: string) => {
            console.log(output);
        });
    }
};

export default command;
