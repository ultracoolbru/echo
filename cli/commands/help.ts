import chalk from 'chalk';
import { loadCommands, EchoCommand } from '../plugin-loader';
import { rl } from './common';

export async function showHelpMenu() {
    console.log(chalk.cyan('\n📚 Available Commands:\n'));
    console.log(chalk.yellow('Git Commands:'));
    console.log('  :git              - Show git status');
    console.log('  :git log          - Show git commit history');
    console.log('  :git diff         - Show changes');
    console.log('  :git branches     - List branches');
    console.log('  :git commit       - Commit changes');
    console.log('  :git commit all   - Commit all changes');
    console.log('  :git init         - Initialize repository');
    console.log('  :git pull         - Pull from remote');
    console.log('  :git push         - Push to remote');
    console.log('  :git stash        - Stash changes');
    console.log('  :git config       - Show git config');
    console.log('  :git checkout <b> - Switch to branch');
    console.log('  :git create <b>   - Create new branch');
    console.log('  :git merge <b>    - Merge branch');

    console.log(chalk.yellow('\nTask Commands:'));
    console.log('  :tasks            - List all tasks');
    console.log('  :task add         - Add new task');
    console.log('  :task done <num>  - Mark task as done');

    console.log(chalk.yellow('\nDev Agent Commands:'));
    console.log('  :agent            - Start dev agent session');
    console.log('  :clear            - Clear log files');
    console.log('  :diag             - Run diagnostics');
    console.log('  :project init     - Initialize project structure');
    console.log('  :reload env       - Reload environment variables');
    console.log('  :help             - Show this menu');
    console.log('  exit              - Exit Echo CLI');
}

const command: EchoCommand = {
    name: ':help',
    description: 'Show Echo CLI help menu',
    async run() {
        const commands: EchoCommand[] = await loadCommands('./cli/commands');
        console.log(chalk.gray(`Loaded ${commands.length} commands from plugins.`));

        console.log(chalk.cyan('\n🔧 Available Commands:'));
        for (const cmd of commands) {
            console.log(`${cmd.name.padEnd(15)} — ${cmd.description}`);
        }
        rl.prompt();
    }
};

export default command;