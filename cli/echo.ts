import chalk from 'chalk';
import { rl } from './common';

import { buildCommandMap, EchoCommand, loadCommands } from './plugin-loader';

async function EchoAgent(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('🤖 Echo CLI – Developer Assistant'));
    console.log(chalk.gray('Type commands like :git, :task add, :tasks, :agent, or exit'));

    // Load all plugin commands at startup
    const commands: EchoCommand[] = await loadCommands('./cli/commands');

    console.log(chalk.gray(`Loaded ${commands.length} commands from plugins.`));

    // Build help from descriptions
    const commandMap = buildCommandMap(commands);

    const routes: Record<string, () => Promise<void>> = {
        ':help': () => runMatchedCommand(':help', commandMap),
        // Git Status
        ':git': () => runMatchedCommand(':git', commandMap),
        ':git status': () => runMatchedCommand(':git status', commandMap),
        ':git st': () => runMatchedCommand(':git st', commandMap),
        ':gs': () => runMatchedCommand(':gs', commandMap),

        // Git Log
        ':git log': () => runMatchedCommand(':git log', commandMap),
        ':git lg': () => runMatchedCommand(':git lg', commandMap),
        ':gl': () => runMatchedCommand(':gl', commandMap),

        // Git Diff
        ':git diff': () => runMatchedCommand(':git diff', commandMap),
        ':gd': () => runMatchedCommand(':gd', commandMap),

        // Git Branches
        ':git branches': () => runMatchedCommand(':git branches', commandMap),
        ':gb': () => runMatchedCommand(':gb', commandMap),

        // Git Commit
        ':git commit': () => runMatchedCommand(':git commit', commandMap),
        ':gc': () => runMatchedCommand(':gc', commandMap),

        // Git Commit All
        ':git commit all': () => runMatchedCommand(':git commit all', commandMap),
        ':gca': () => runMatchedCommand(':gca', commandMap),

        // Git Init
        ':git init': () => runMatchedCommand(':git init', commandMap),
        ':gi': () => runMatchedCommand(':gi', commandMap),

        // Git Pull
        ':git pull': () => runMatchedCommand(':git pull', commandMap),
        ':gpull': () => runMatchedCommand(':gpull', commandMap),

        // Git Push
        ':git push': () => runMatchedCommand(':git push', commandMap),
        ':gpush': () => runMatchedCommand(':gpush', commandMap),

        // Git Stash
        ':git stash': () => runMatchedCommand(':git stash', commandMap),
        ':gstash': () => runMatchedCommand(':gstash', commandMap),

        // Git Config
        ':git config': () => runMatchedCommand(':git config', commandMap),
        ':gconfig': () => runMatchedCommand(':gconfig', commandMap),

        // Git Checkout
        ':git checkout': () => runMatchedCommand(':git checkout', commandMap),
        ':gcheckout': () => runMatchedCommand(':gcheckout', commandMap),

        // Git Branch
        ':git branch': () => runMatchedCommand(':git branch', commandMap),
        ':gbranch': () => runMatchedCommand(':gbranch', commandMap),

        // AI Agent
        ':agent': () => runMatchedCommand(':agent', commandMap),

        // Diagnostics
        ':diag': () => runMatchedCommand(':diag', commandMap),

    }

    rl.prompt();

    rl.on('line', async (input) => {
        const command = input.trim();

        if (command === 'exit') {
            rl.close();
        }

        if (routes[command]) {
            if (command === ':git branch' || command === ':gbranch') {
                const branch = command.split(' ')[2];
                if (!branch) return console.log(chalk.red('❌ Usage: :git branch <branch>'));
                await routes[command]();
            } else {
                await routes[command]();
            }
        }


        // } else if (command === ':git branch') {
        //     const branch = command.split(' ')[2];
        //     if (!branch) return console.log(chalk.red('❌ Usage: :git branch <branch>'));
        //     await runMatchedCommand();
        // } else if (command === ':git create') {
        //     const branch = command.split(' ')[2];
        //     if (!branch) return console.log(chalk.red('❌ Usage: :git create <branch>'));
        //     await runMatchedCommand();
        // } else if (command.startsWith(':git merge')) {
        //     const branch = command.split(' ')[2];
        //     if (!branch) return console.log(chalk.red('❌ Usage: :git merge <branch>'));
        //     await runMatchedCommand();
        // } else if (command === ':tasks') {
        //     const tasks = await listTasks();
        //     if (!tasks.length) return console.log(chalk.yellow('\n📂 No tasks found.'));
        //     console.log(chalk.green(`\n📋 ${tasks.length} tasks:`));
        //     tasks.forEach((task, i) => {
        //         console.log(`\n#${i + 1} - ${task.title}`);
        //         console.log(chalk.yellow('  Prompt: ') + task.prompt);
        //         console.log(chalk.green('  Status: ') + task.status);
        //     });
        // } else if (command === ':task add') {
        //     const prompt = await ask(chalk.cyan('🧠 Save prompt for task: '));
        //     await saveTask(prompt, prompt);
        //     console.log(chalk.green('✅ Task saved.'));
        // } else if (command.startsWith(':task done')) {
        //     const n = parseInt(command.split(' ')[2]);
        //     if (isNaN(n)) return console.log(chalk.red('❌ Invalid task number.'));
        //     const task = await markTaskDone(n - 1);
        //     console.log(chalk.green(`✅ Task "${task.title}" marked as done.`));
        // } else if (command === ':clear' || command === ':clear logs' || command === ':logs clear' || command === ':logs') {
        //     await runMatchedCommand();
        //     console.log(chalk.green('✅ Logs cleared.'));
        // } else if (command === ':diag') {
        //     await runMatchedCommand();
        //     console.log(chalk.green('✅ Diagnostics completed.'));
        // } else if (command === ':agent' || command === ':echo agent' || command === ':dev agent' || command === ':dev') {
        //     await runMatchedCommand();
        // } else if (command.startsWith(':project init')) {
        //     const args = command.split(' ').slice(3);
        //     const projectName = command.split(' ')[2];
        //     if (!projectName) return console.log(chalk.red('❌ Project name is required.'));
        //     if (args.length === 0) return console.log(chalk.red('❌ No folders specified.'));
        //     await runMatchedCommand();
        //     console.log(chalk.green(`✅ Project structure initialized in ${projectName}/`));
        // } else if (command === ':project add') {
        //     // await addProjectFile();
        //     // console.log(chalk.green('✅ Project file added.'));
        // } else if (command === ':reload env') {
        //     await runMatchedCommand();
        // } else {
        //     console.log(chalk.red(`❌ Unknown command: ${command}`));
        // }

        rl.prompt(true);
    }).on('close', () => {
        console.log(chalk.yellow('👋 Goodbye.'));
        process.exit(0);
    });
}

interface Command {
    run: (args: string[]) => Promise<void>;
}

type CommandMap = Map<string, Command>;

async function runMatchedCommand(command: string, commandMap: CommandMap): Promise<void> {
    console.log(chalk.gray(`\n🔍 Running command: ${command}`));
    const tokens: string[] = command.trim().split(/\s+/);

    // Try longest match first
    let matchedCommand: string = '';
    for (let i = tokens.length; i > 0; i--) {
        const tryCmd: string = tokens.slice(0, i).join(' ');
        if (commandMap.has(tryCmd)) {
            matchedCommand = tryCmd;
            break;
        }
    }

    if (!matchedCommand) {
        console.log(chalk.red(`❌ Unknown command: ${tokens[0]}...`));
        return;
    }

    const args: string[] = tokens.slice(matchedCommand.split(' ').length);
    const match: Command | undefined = commandMap.get(matchedCommand);
    await match!.run(args);
}

export async function runEchoAgent() {
    console.log(chalk.cyan.bold('🤖 Echo CLI – Developer Assistant'))
    console.log(chalk.gray('Type commands like :git, :task add, :tasks, :agent, or exit'));
    console.log(chalk.gray('Type :help for a list of commands.'));
    console.log(chalk.gray('Press Ctrl+C to exit.'));
    console.log(chalk.gray('Press :agent to return to Echo CLI.'));
    await EchoAgent();
}

export default EchoAgent();

