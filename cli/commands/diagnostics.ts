import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { EchoCommand } from '../plugin-loader';
import chalk from 'chalk';
import axios from 'axios';
import { exec } from 'child_process';

// Configure environment
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Basic error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] Unhandled Rejection at: ${promise}\nReason: ${reason}\n\n`);
  console.error('UNHANDLED REJECTION:', reason);
});

// MongoDB connection details
const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB ?? 'echo';

// Force console logs to appear
const originalConsoleLog = console.log;
console.log = (...args) => {
  fs.appendFileSync('console.log', `[${new Date().toISOString()}] ${args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}\n`);
  originalConsoleLog(...args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  fs.appendFileSync('console.log', `[${new Date().toISOString()}] ERROR: ${args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}\n`);
  originalConsoleError(...args);
};

async function diagnoseSystem() {
  console.log('Starting MongoDB connection diagnosis...');
  console.log(`Using URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

  let client: MongoClient | null = null;

  try {
    console.log('Creating new MongoDB client...');
    client = new MongoClient(uri);

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB server');

    console.log('Testing database access...');
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in ${dbName} database:`);

    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }

    // Test tasks collection specifically
    const taskCollection = db.collection('tasks');
    const count = await taskCollection.countDocuments();
    console.log(`Found ${count} documents in tasks collection`);

    if (count > 0) {
      const tasks = await taskCollection.find().limit(5).toArray();
      console.log('Sample task data (first 5 documents):');
      tasks.forEach((task, i) => {
        console.log(`#${i + 1}: ${JSON.stringify({
          id: task._id.toString(),
          title: task.title,
          status: task.status
        })}`);
      });
    }

    console.log('MongoDB diagnosis completed successfully\n');

    // Run environment variables diagnosis.
    await runDiagnosticsOnEnvVars();
    console.log('Environment variables diagnosis completed successfully\n');

    // Run file system checks.
    await runDiagnosticsOnFileSystem();
    console.log('File system checks completed successfully\n');

    // Run network connectivity checks.
    await runDiagnosticsOnNetwork();
    console.log('Network connectivity checks completed successfully\n');

    // Run version checks.
    await runDiagnosticsOnVersion();
    console.log('Version checks completed successfully\n');

    // Run git repository checks.
    await runDiagnosticOnGit();
    console.log('Git repository checks completed successfully\n');
  } catch (error) {
    console.error('MongoDB diagnostic error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

async function runDiagnosticsOnEnvVars(): Promise<void> {
  console.log('\n--- Environment Variables Check ---');
  const requiredEnvVars = ['LLM_MODEL', 'MONGODB_URI', 'MONGODB_DB', 'OPENROUTER_API_KEY',
    'OPENROUTER_MODEL', 'CLIENT_ID', 'PROJECT_ID', 'AUTH_URI', 'TOKEN_URI',
    'AUTH_PROVIDER_X509_CERT_URL', 'CLIENT_SECRET', 'REDIRECT_URIS', 'ACCESS_TOKEN',
    'REFRESH_TOKEN', 'SCOPE', 'TOKEN_TYPE', 'TOKEN_ID', 'REFRESH_TOKEN_EXPIRES_IN',
    'EXPIRY_DATE'
  ]; // Example: Add your required env vars
  let allVarsPresent = true;

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.log(chalk.red(`Missing environment variable: ${envVar}`));
      allVarsPresent = false;
    } else {
      console.log(chalk.green(`Environment variable ${envVar} is set.`));
    }
  });

  if (!allVarsPresent) {
    console.log(chalk.yellow('Warning: Some environment variables are missing.  The CLI might not function correctly.'));
  } else {
    console.log(chalk.green('All required environment variables are set.'));
  }
}

async function runDiagnosticsOnFileSystem() {
  console.log('\n--- File System Checks ---');
  const requiredFiles = ['./cli/commands', './data/tasks.json']; // Example: Add your required files/dirs

  let allFilesPresent = true;

  requiredFiles.forEach(file => {
    const fullPath = path.resolve(__dirname, '..', '..', file); // Adjust path as needed
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.red(`Missing file or directory: ${fullPath}`));
      allFilesPresent = false;
    } else {
      console.log(chalk.green(`File or directory exists: ${fullPath}`));
    }
  });

  if (!allFilesPresent) {
    console.log(chalk.yellow('Warning: Some files or directories are missing. The CLI might not function correctly.'));
  } else {
    console.log(chalk.green('All required files and directories are present.'));
  }
}

async function runDiagnosticsOnNetwork() {
  console.log('\n--- Network Connectivity Check ---');
  const urlsToCheck = ['http://localhost:11434'];
  let allUrlsReachable = true;

  for (const url of urlsToCheck) {
    try {
      if (!url) {
        console.log(chalk.red('URL is undefined or invalid.'));
        //allUrlsReachable = false;
        console.log(chalk.red(`URL ${url} is not reachable.`));
        continue;
      }

      let response = await axios.get(url, { timeout: 5000 });

      if (response.status === 200) {
        console.log(chalk.green(`URL ${url} is reachable.`));
        console.log(`Response status: ${response.status}`);
        console.log(`Response status text: ${response.statusText}`);
        console.log(chalk.green('Network connectivity check completed successfully'));
        allUrlsReachable = true;
      } else {
        console.log(chalk.red(`URL ${url} is not reachable.`));
        allUrlsReachable = false;
      }
    } catch (error) {
      console.log(chalk.red(`Error checking URL ${url}: ${error}`));
      allUrlsReachable = false;
    }
    if (!allUrlsReachable) {
      console.log(chalk.yellow('Warning: Some URLs are not reachable. The CLI might not function correctly.'));
    } else {
      console.log(chalk.green('All URLs are reachable.'));
    }
  }
}

async function runDiagnosticsOnVersion() {
  console.log('\n--- Version Check ---');
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json'); // Adjust path
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`CLI Version: ${packageJson.version}`);
    // You can also list versions of key dependencies here
    console.log(`chalk: ${packageJson.dependencies.chalk}`);
    console.log(`mongodb: ${packageJson.dependencies.mongodb}`);
    console.log(`dotenv: ${packageJson.dependencies.dotenv}`);
    console.log(`path: ${packageJson.dependencies.path}`);
    console.log(`fs: ${packageJson.dependencies.fs}`);
    console.log(`axios: ${packageJson.dependencies.axios}`);
    console.log(`open: ${packageJson.dependencies.open}`);
    console.log(`googleapis: ${packageJson.dependencies.googleapis}`);
    console.log(`simple-git: ${packageJson.dependencies['simple-git']}`);
    console.log(`node-cron: ${packageJson.dependencies['node-cron']}`);
    console.log(`@inquirer/prompts: ${packageJson.dependencies['@inquirer/prompts']}`);

  } catch (error: any) {
    console.log(chalk.red(`Error reading package.json: ${error.message}`));
  }
}

async function runDiagnosticOnGit() {
  console.log('\n--- Git Repository Check ---');

exec('git rev-parse --is-inside-work-tree', (error, stdout, stderr) => {
    if (error) {
        console.log(chalk.red('Not a Git repository or Git not installed.'));
        console.error(`exec error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return;
    }
    if (stdout.trim() === 'true') {
        console.log(chalk.green('Running inside a Git repository.'));
    } else {
        console.log(chalk.yellow('Not running inside a Git repository.'));
    }
});
}

const command: EchoCommand = {
  name: ':diag',
  description: 'Run diagnostics on the system',
  aliases: [':diagnostics', ':diag mongo', ':mongo diag'],
  async run(args: string[]) {
    console.log('🔧 Running git merge...');
    diagnoseSystem();
    console.log(chalk.green('✅ Command Executed.\n'));
  }
};

export default command;