import { spawnSync } from 'child_process';

export function runGitCommand(args: string[], callback: (output: string) => void) {
  try {
    const result = spawnSync('git', args, { encoding: 'utf8' });
    if (result.error) throw result.error;
    callback(result.stdout.trim());
  } catch (err: any) {
    callback(`❌ Git Error: ${err.message || err}`);
  }
}

export function getDiff(callback: (output: string) => void) {
  runGitCommand(['diff'], callback);
}

export function commitAll(message: string, callback: (output: string) => void) {
  runGitCommand(['add', '.'], () => {
    runGitCommand(['commit', '-m', message], callback);
  });
}

export function commit(message: string, callback: (output: string) => void) {
  runGitCommand(['commit', '-m', message], callback);
}

export function createBranch(branch: string, callback: (output: string) => void) {
  runGitCommand(['checkout', '-b', branch], callback);
}

export function mergeBranch(branch: string, callback: (output: string) => void) {
  runGitCommand(['merge', branch], callback);
}

export function initRepo(callback: (output: string) => void) {
  runGitCommand(['init'], callback);
}

export function pullRemote(callback: (output: string) => void) {
  runGitCommand(['pull'], callback);
}

export function pushRemote(callback: (output: string) => void) {
  runGitCommand(['push'], callback);
}

export function stashChanges(callback: (output: string) => void) {
  runGitCommand(['stash'], callback);
}

export function showGitConfig(callback: (output: string) => void) {
  runGitCommand(['config', '--list'], callback);
}