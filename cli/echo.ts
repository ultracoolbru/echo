import chalk from 'chalk';
import {
    listTasks,
    saveTask,
    markTaskDone
} from '../data/tasks';
import { rl, ask } from './common';

import { loadCommands, buildCommandMap, EchoCommand } from './plugin-loader';

async function EchoAgent() {
    console.clear();
    console.log(chalk.cyan.bold('🤖 Echo CLI – Developer Assistant'));
    console.log(chalk.gray('Type commands like :git, :task add, :tasks, :agent, or exit'));

    // Load all plugin commands at startup
    const commands: EchoCommand[] = await loadCommands('./cli/commands');

    console.log(chalk.gray(`Loaded ${commands.length} commands from plugins.`));

    // Build help from descriptions
    const commandMap = buildCommandMap(commands);

    rl.prompt();

    rl.on('line', async (input) => {
        const command = input.trim();

        if (command === 'exit') {
            rl.close();
        }

        if (command === ':help') {
            await runMatchedCommand();
        }

        if (command === ':git' || command === ':git status' || command === ':git st') {
            await runMatchedCommand();
        } else if (command === ':git log') {
            await runMatchedCommand();
        } else if (command === ':git diff') {
            await runMatchedCommand();
        } else if (command === ':git branches') {
            await runMatchedCommand();
        } else if (command === ':git commit' || command === ':git commit all') {
            const msg = await ask('✍️ Commit message: ');
            if (!msg.trim()) return console.log(chalk.red('❌ Commit message cannot be empty.'));
            await runMatchedCommand();
        } else if (command === ':git init') {
            await runMatchedCommand();
        } else if (command === ':git pull') {
            await runMatchedCommand();
        } else if (command === ':git push') {
            await runMatchedCommand();
        } else if (command === ':git stash') {
            await runMatchedCommand();
        } else if (command === ':git config') {
            await runMatchedCommand();
        } else if (command.startsWith(':git checkout')) {
            const branch = command.split(' ')[2];
            if (!branch) return console.log(chalk.red('❌ Usage: :git checkout <branch>'));
            await runMatchedCommand();
        } else if (command === ':git branch') {
            const branch = command.split(' ')[2];
            if (!branch) return console.log(chalk.red('❌ Usage: :git branch <branch>'));
            await runMatchedCommand();
        } else if (command === ':git create') {
            const branch = command.split(' ')[2];
            if (!branch) return console.log(chalk.red('❌ Usage: :git create <branch>'));
            await runMatchedCommand();
        } else if (command.startsWith(':git merge')) {
            const branch = command.split(' ')[2];
            if (!branch) return console.log(chalk.red('❌ Usage: :git merge <branch>'));
            await runMatchedCommand();
        } else if (command === ':tasks') {
            const tasks = await listTasks();
            if (!tasks.length) return console.log(chalk.yellow('\n📂 No tasks found.'));
            console.log(chalk.green(`\n📋 ${tasks.length} tasks:`));
            tasks.forEach((task, i) => {
                console.log(`\n#${i + 1} - ${task.title}`);
                console.log(chalk.yellow('  Prompt: ') + task.prompt);
                console.log(chalk.green('  Status: ') + task.status);
            });
        } else if (command === ':task add') {
            const prompt = await ask(chalk.cyan('🧠 Save prompt for task: '));
            await saveTask(prompt, prompt);
            console.log(chalk.green('✅ Task saved.'));
        } else if (command.startsWith(':task done')) {
            const n = parseInt(command.split(' ')[2]);
            if (isNaN(n)) return console.log(chalk.red('❌ Invalid task number.'));
            const task = await markTaskDone(n - 1);
            console.log(chalk.green(`✅ Task "${task.title}" marked as done.`));
        } else if (command === ':clear') {
            await runMatchedCommand();
            console.log(chalk.green('✅ Logs cleared.'));
        } else if (command === ':diag') {
            await runMatchedCommand();
            console.log(chalk.green('✅ Diagnostics completed.'));
        } else if (command === ':agent') {
            await runMatchedCommand();
        } else if (command.startsWith(':project init')) {
            const args = command.split(' ').slice(3);
            const projectName = command.split(' ')[2];
            if (!projectName) return console.log(chalk.red('❌ Project name is required.'));
            if (args.length === 0) return console.log(chalk.red('❌ No folders specified.'));
            await runMatchedCommand();
            console.log(chalk.green(`✅ Project structure initialized in ${projectName}/`));
        } else if (command === ':project add') {
            // await addProjectFile();
            // console.log(chalk.green('✅ Project file added.'));
        } else if (command === ':reload env') {
            await runMatchedCommand();
        } else {
            console.log(chalk.red(`❌ Unknown command: ${command}`));
        }

        rl.prompt(true);

        async function runMatchedCommand() {
            console.log(chalk.gray(`\n🔍 Running command: ${command}`));
            const tokens = command.trim().split(/\s+/);

            // Try longest match first
            // let matchedCommand = '';
            // for (let i = tokens.length; i > 0; i--) {
            //     const tryCmd = tokens.slice(0, i).join(' ');
            //     if (commandMap.has(tryCmd)) {
            //         matchedCommand = tryCmd;
            //         break;
            //     }
            // }

            // if (!matchedCommand) {
            //     console.log(chalk.red(`❌ Unknown command: ${tokens[0]}...`));
            //     return;
            // }

            const args = tokens.slice(command.split(' ').length);
            const match = commandMap.get(command);
            await match!.run(args);
        }
    }).on('close', () => {
        console.log(chalk.yellow('👋 Goodbye.'));
        process.exit(0);
    });
}

EchoAgent();

