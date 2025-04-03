import readline from 'readline';
import chalk from 'chalk';
import {
    getStatus,
    getLog,
    getDiff,
    getBranches,
    checkoutBranch,
    commitAll,
    commit,
    createBranch,
    mergeBranch,
    initRepo,
    pullRemote,
    pushRemote,
    stashChanges,
    showGitConfig
} from './git';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

function ask(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

async function EchoAgent() {
    console.clear();
    console.log(chalk.cyan.bold('🤖 Echo CLI – Developer Assistant'));
    console.log(chalk.gray('Type commands like :git, :task add, :tasks, :agent, or exit'));

    rl.prompt();

    rl.on('line', async (input) => {
        const command = input.trim();

        if (command === 'exit') {
            rl.close();
        }

        if (command === ':git') {
            getStatus((res) => console.log(chalk.cyan('\n🔧 Git Status:\n') + res));
        } else if (command === ':git log') {
            getLog((res) => console.log(chalk.cyan('\n📜 Git Log:\n') + res));
        } else if (command === ':git diff') {
            getDiff((res) => console.log(chalk.cyan('\n🔍 Git Diff:\n') + res));
        } else if (command === ':git branches') {
            getBranches((res) => console.log(chalk.cyan('\n🌿 Git Branches:\n') + res));
        } else if (command === ':git commit') {
            const msg = await ask('✍️ Commit message: ');
            if (!msg.trim()) return console.log(chalk.red('❌ Commit message cannot be empty.'));
            commit(msg.trim(), (res) => console.log(chalk.green('\n✅ Git Commit Result:\n') + res));
        } else if (command === ':git commit all') {
            const msg = await ask('✍️ Commit message: ');
            if (!msg.trim()) return console.log(chalk.red('❌ Commit message cannot be empty.'));
            commitAll(msg.trim(), (res) => console.log(chalk.green('\n✅ Git Commit Result:\n') + res));
        }

        rl.prompt(true);
    }).on('close', () => {
        console.log(chalk.yellow('👋 Goodbye.'));
        process.exit(0);
    });
}

EchoAgent();