import * as readline from 'readline';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

export const MODEL = process.env.LLM_MODEL ?? 'codellama:7b-code-q4_K_M';
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-v3-base:free';

export function ask(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}