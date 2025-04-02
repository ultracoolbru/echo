import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

import { askInput } from "./common";

export async function loadProjectMetadata(): Promise<Record<string, any> | null> {
    const project = await askInput(chalk.cyan('🔍 Load project metadata from echo-project.json? (y/n): '));
    const configPath = path.resolve('./projects/echo-project.json');
    if (project.trim().toLowerCase() === 'y' && fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return null;
}