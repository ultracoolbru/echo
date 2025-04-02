import { spawn } from 'child_process';

function runGitCommand(args: string[], callback: (output: string) => void) {
  const child = spawn('git', args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true
  });

  let output = '';
  let error = '';

  child.stdout.on('data', (data) => (output += data.toString()));
  child.stderr.on('data', (data) => (error += data.toString()));

  child.on('close', (code) => {
    if (code !== 0) callback(`❌ ${error.trim() || 'Unknown error'}`);
    else callback(output.trim());
  });
}

export function getStatus(callback: (output: string) => void) {
  runGitCommand(['status'], callback);
}

export function getLog(callback: (output: string) => void) {
  runGitCommand(['log', '-n', '5', '--pretty=format:%h %s (%cr)'], callback);
}

export function getDiff(callback: (output: string) => void) {
  runGitCommand(['diff'], callback);
}

export function getBranches(callback: (output: string) => void) {
  runGitCommand(['branch'], callback);
}

export function checkoutBranch(branch: string, callback: (output: string) => void) {
  runGitCommand(['checkout', branch], callback);
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