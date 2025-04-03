import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';

export function reloadEnv() {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    console.log(chalk.green('🔄 Environment variables reloaded from .env'));
}