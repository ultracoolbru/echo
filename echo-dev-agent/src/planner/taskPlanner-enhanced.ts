import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
import path from "path";
import { config } from "../../agent.config";

// Simple file-based context gathering
function gatherCodebaseContext(rootDir: string = "."): string {
    const codeFiles: string[] = [];
    const maxFiles = 20; // Limit to avoid too much context

    function walk(dir: string) {
        if (codeFiles.length >= maxFiles) return;

        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                if (codeFiles.length >= maxFiles) break;

                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                // Skip node_modules, .git, echo-dev-agent and other common directories
                if (stat.isDirectory() && !["node_modules", ".git", "dist", "build", ".venv", "echo-dev-agent"].includes(item)) {
                    walk(fullPath);
                } else if (stat.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".js") || fullPath.endsWith(".json"))) {
                    try {
                        const content = fs.readFileSync(fullPath, "utf-8");
                        // Include file path and a snippet of content
                        const snippet = content.length > 500 ? content.substring(0, 500) + "..." : content;
                        codeFiles.push(`File: ${fullPath}\n${snippet}\n---\n`);
                    } catch (e) {
                        // Skip files that can't be read
                    }
                }
            }
        } catch (e) {
            // Skip directories that can't be read
        }
    }

    walk(rootDir);
    return codeFiles.join("\n");
}

export async function planTask(task: string): Promise<string> {
    const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.4 });

    console.log("🔍 Gathering codebase context for analysis...");
    // Analyze from the root Echo project directory (parent directory)
    const rootProjectDir = path.join(__dirname, "../../../");
    const codebaseContext = gatherCodebaseContext(rootProjectDir);

    const prompt = `Analyze and plan this dev task for the Echo project: "${task}".

Here's the current codebase context from the root Echo project:
${codebaseContext}

Based on this codebase structure and content, return a clear, numbered list of steps and include relevant filenames or components that would be involved in this task.

Focus on:
1. Understanding the existing architecture
2. Identifying which files would need changes
3. Suggesting a step-by-step implementation approach
4. Considering dependencies and integration points`;

    const result = await model.invoke([{ role: "user", content: prompt }]);

    return result.content as string;
}
