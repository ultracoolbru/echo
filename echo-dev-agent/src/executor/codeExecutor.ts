import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
import path from "path";
import { config } from "../../agent.config";

export async function executePlan(task: string, plan: string): Promise<string[]> {
  const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.3 });
  const editedFiles: string[] = [];
  const steps = plan.split(/\n\d+\. /).filter(Boolean);

  for (const step of steps) {
    const filenameMatch = step.match(/(?:in|to)\s([\w\/\.\-_]+\.(ts|tsx))/i);
    const filePath = filenameMatch?.[1];
    if (!filePath || !fs.existsSync(filePath)) continue;

    const fullPath = path.resolve(filePath);
    const fileContent = fs.readFileSync(fullPath, "utf-8");

    const prompt = new PromptTemplate({
      template: `
You are an expert developer working on the Echo project.
Follow this instruction and return ONLY the modified code, ready to overwrite the file.

Task: {task}
Step: {step}
File: {filePath}

Current file content:
{fileContent}
`,
      inputVariables: ["task", "step", "filePath", "fileContent"]
    });

    const input = await prompt.format({ task, step, filePath, fileContent });
    const editedChunk = await model.invoke(input);
    const edited = typeof editedChunk === "string" ? editedChunk : editedChunk?.content ?? "";

    if (edited && edited.length > 0 && edited !== fileContent) {
      fs.writeFileSync(fullPath, String(edited), "utf-8");
      editedFiles.push(filePath);
    }
  }

  return editedFiles;
}