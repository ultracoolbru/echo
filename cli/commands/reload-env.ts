import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';
import { EchoCommand } from '../plugin-loader';

function reloadEnv() {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    console.log(chalk.green('🔄 Environment variables reloaded from .env'));
}

const command: EchoCommand = {
    name: ':reload env',
    description: 'Reload environment variables from .env file',
    async run() {
        console.log('🔧 Running command...');
        reloadEnv();
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;