import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

export const MODEL = process.env.LLM_MODEL ?? 'codellama:7b-code-q4_K_M';
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-v3-base:free';
export const OPENROUTER_URL = process.env.OPENROUTER_URL ?? 'https://api.openrouter.ai/v1/chat/completions';
export const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL ?? 'http://localhost:8000/v1/chat/completions';

export function ask(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}