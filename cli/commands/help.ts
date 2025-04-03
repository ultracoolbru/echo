import chalk from 'chalk';
import { loadCommands, EchoCommand } from '../plugin-loader';
import { rl } from '../common';

export async function showHelpMenu() {
    console.log(chalk.cyan('\n📚 Available Commands:\n'));

    console.log(chalk.yellow('\nTask Commands:'));
    console.log('  :tasks            - List all tasks');
    console.log('  :task add         - Add new task');
    console.log('  :task done <num>  - Mark task as done');

    console.log(chalk.yellow('\nDev Agent Commands:'));
    console.log('  :diag             - Run diagnostics');
    console.log('  :reload env       - Reload environment variables');
    console.log('  exit              - Exit Echo CLI');
}

const command: EchoCommand = {
    name: ':help',
    description: 'Show Echo CLI help menu',
    async run() {
        const commands: EchoCommand[] = await loadCommands('./cli/commands');
        console.log(chalk.gray(`Loaded ${commands.length} commands from plugins.`));

        console.log(chalk.cyan('\n📚 Available Commands:'));
        for (const cmd of commands) {
            console.log(`${cmd.name.padEnd(15)} — ${cmd.description}`);
        }
        rl.prompt();
    }
};

export default command;
