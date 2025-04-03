import fs from 'fs';
import path from 'path';

export interface EchoCommand {
  name: string;
  description: string;
  aliases?: string[];
  run: (args: string[]) => Promise<void>;
}

export async function loadCommands(dir: string): Promise<EchoCommand[]> {
  const commands: EchoCommand[] = [];

  if (!fs.existsSync(dir)) {
    console.warn(`[⚠️] Plugin command folder not found: ${dir}`);
    return commands;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of files) {
    const modPath = path.resolve(dir, file);
    const mod = await import(modPath);
    if (mod.default && typeof mod.default.run === 'function') {
      commands.push(mod.default as EchoCommand);
    }
  }

  return commands;
}

export function buildCommandMap(commands: EchoCommand[]): Map<string, EchoCommand> {
  const map = new Map<string, EchoCommand>();
  for (const cmd of commands) {
    map.set(cmd.name, cmd);
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        map.set(alias, cmd);
      }
    }
  }
  return map;
}