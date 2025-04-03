import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { EchoCommand } from '../plugin-loader';

async function initProjectStructure(projectName: string, args: string[]) {
    const projectPath = path.resolve(`./${projectName}`);
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath);
        console.log(chalk.green(`📁 Created ${projectName}/`));
    }
    const folders = args.map((arg) => path.resolve(projectPath, arg));
    if (!fs.existsSync(path.resolve(projectPath, 'src'))) {
        fs.mkdirSync(path.resolve(projectPath, 'src'));
        console.log(chalk.green('📁 Created src/'))
    };

    for (const dir of folders) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log(chalk.green(`📁 Created ${dir}/`));
        }
    }
    const gitignore = path.resolve('./.gitignore');
    if (!fs.existsSync(gitignore)) {
        fs.writeFileSync(gitignore, 'node_modules\n.env\ndist');
        console.log(chalk.green('📄 Created .gitignore'));
    }
}

const command: EchoCommand = {
    name: ':project init',
    description: 'Initialize a new project structure (project name and folders)',
    async run(args: string[]) {
        console.log('🔧 Running project init...');
        initProjectStructure(args[0], args.slice(1)).catch((err) => {
            console.error(chalk.red('❌ Error initializing project structure:'), err.message);
        });
        console.log(chalk.green('✅ Command Executed.\n'));
    }
};

export default command;
