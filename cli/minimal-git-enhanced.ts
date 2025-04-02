import readline from 'readline';
import chalk from 'chalk';
import simpleGit from 'simple-git';

const git = simpleGit();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function askInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.clear();
  console.log(chalk.cyan.bold('🧪 Echo Minimal CLI – Git Enhanced'));
  console.log(chalk.gray('Type ":git", ":git log", ":git commit", ":git diff", ":git branches", ":git checkout <name>" or "exit".'));

  while (true) {
    const input = await askInput('\n> ');
    const parts = input.trim().split(' ');

    if (input.trim() === 'exit') {
      console.log(chalk.yellow('👋 Goodbye.'));
      rl.close();
      process.exit(0);
    }

    if (parts[0] === ':git') {
      try {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) return console.log(chalk.red('❌ Not inside a Git repository.'));

        switch (parts[1]) {
          case undefined:
            const status = await git.status();
            console.log(chalk.cyan('\n🔧 Git Status:'));
            console.log(`Branch: ${status.current}`);
            console.log('Staged:', status.staged.join(', ') || 'None');
            console.log('Untracked:', status.not_added.join(', ') || 'None');
            break;

          case 'log':
            const log = await git.log({ n: 5 });
            console.log(chalk.cyan('\n🕒 Recent Commits:'));
            log.all.forEach((commit, i) => {
              console.log(`\n#${i + 1}`);
              console.log(`  Message: ${commit.message}`);
              console.log(`  Author: ${commit.author_name}`);
              console.log(`  Date: ${commit.date}`);
              console.log(`  Hash: ${commit.hash}`);
            });
            break;

          case 'diff':
            const diff = await git.diff();
            console.log(chalk.cyan('\n📝 Git Diff:'));
            console.log(diff || 'No changes.');
            break;

          case 'commit':
            const commitMsg = await askInput('✍️ Commit message: ');
            await git.add('./*');
            await git.commit(commitMsg || 'Echo automated commit');
            console.log(chalk.green('✅ Changes committed.'));
            break;

          case 'branches':
            const branches = await git.branch();
            console.log(chalk.cyan('\n🌿 Git Branches:'));
            Object.entries(branches.branches).forEach(([name, info]) => {
              console.log(`${info.current ? '👉 ' : '   '}${name}`);
            });
            break;

          case 'checkout':
            const branch = parts[2];
            if (!branch) {
              console.log(chalk.red('❌ Please provide a branch name.'));
              break;
            }
            await git.checkout(branch);
            console.log(chalk.green(`✅ Switched to branch ${branch}`));
            break;

          default:
            console.log(chalk.red(`❌ Unknown git command: ${parts[1]}`));
        }
      } catch (err: any) {
        console.error(chalk.red('❌ Git command failed:'), err.message);
      }
    } else {
      console.log(chalk.red('❌ Unsupported command. Use ":git ..." or "exit".'));
    }
  }
})();