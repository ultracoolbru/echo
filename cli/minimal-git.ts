import readline from 'readline';
import chalk from 'chalk';
import {
  getStatus,
  getLog,
  getDiff,
  getBranches,
  checkoutBranch,
  commitAll,
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

console.clear();
console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Git'));
console.log(chalk.gray('Commands: :git, :git init, :git log, :git diff, :git branches, :git checkout <branch>, :git commit, :git create <branch>, :git merge <branch>, :git pull, :git push, :git stash, :git config, exit'));
rl.prompt();

rl.on('line', async (input) => {
  const command = input.trim();

  if (command === 'exit') {
    console.log(chalk.yellow('👋 Goodbye.'));
    rl.close();
    process.exit(0);
  }

  if (command === ':git') {
    getStatus((res) => {
      console.log(chalk.cyan('\n🔧 Git Status:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git log') {
    getLog((res) => {
      console.log(chalk.cyan('\n📜 Git Log:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git diff') {
    getDiff((res) => {
      console.log(chalk.cyan('\n🔍 Git Diff:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git branches') {
    getBranches((res) => {
      console.log(chalk.cyan('\n🌿 Git Branches:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git commit') {
    const msg = await ask('✍️ Commit message: ');
    if (!msg.trim()) {
      console.log(chalk.red('❌ Commit message cannot be empty.'));
      rl.prompt();
    } else {
      commitAll(msg.trim(), (res) => {
        console.log(chalk.green('\n✅ Git Commit Result:\n') + res);
        rl.prompt();
      });
    }
  } else if (command === ':git init') {
    initRepo((res) => {
      console.log(chalk.green('\n✅ Git Repo Initialized:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git pull') {
    pullRemote((res) => {
      console.log(chalk.green('\n⬇️ Git Pull Result:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git push') {
    pushRemote((res) => {
      console.log(chalk.green('\n⬆️ Git Push Result:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git stash') {
    stashChanges((res) => {
      console.log(chalk.green('\n📦 Git Stash Result:\n') + res);
      rl.prompt();
    });
  } else if (command === ':git config') {
    showGitConfig((res) => {
      console.log(chalk.green('\n⚙️ Git Config:\n') + res);
      rl.prompt();
    });
  } else if (command.startsWith(':git checkout')) {
    const branch = command.split(' ')[2];
    if (!branch) {
      console.log(chalk.red('❌ Usage: :git checkout <branch>'));
    } else {
      checkoutBranch(branch, (res) => {
        console.log(chalk.green(`\n✅ Switched to branch: ${branch}\n` + res));
      });
    }
    rl.prompt();
  } else if (command.startsWith(':git create')) {
    const branch = command.split(' ')[2];
    if (!branch) {
      console.log(chalk.red('❌ Usage: :git create <branch>'));
    } else {
      createBranch(branch, (res) => {
        console.log(chalk.green(`\n✅ Created and switched to branch: ${branch}\n` + res));
      });
    }
    rl.prompt();
  } else if (command.startsWith(':git merge')) {
    const branch = command.split(' ')[2];
    if (!branch) {
      console.log(chalk.red('❌ Usage: :git merge <branch>'));
    } else {
      mergeBranch(branch, (res) => {
        console.log(chalk.green(`\n✅ Merged branch: ${branch}\n` + res));
      });
    }
    rl.prompt();
  } else {
    console.log(chalk.red('❌ Unsupported command.'));
    rl.prompt();
  }
});