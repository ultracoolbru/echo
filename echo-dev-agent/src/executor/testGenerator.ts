import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "../../agent.config";

/**
 * Generates Jest tests for modified TypeScript files.
 * @param modifiedFiles List of modified file paths.
 * @returns List of generated test file paths.
 */
export async function generateTests(modifiedFiles: string[]): Promise<string[]> {
  const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.2 });
  const generatedTests: string[] = [];

  try {
    for (const filePath of modifiedFiles) {
      const ext = path.extname(filePath);
      const basename = path.basename(filePath, ext);
      const dir = path.dirname(filePath);
      const testDir = dir.replace("src", "tests");
      const testFilePath = path.join(testDir, `${basename}.test${ext}`);

      const content = fs.readFileSync(filePath, "utf-8");
      const prompt = `Write comprehensive Jest tests for the following TypeScript module:

${content}

Place tests in file: ${testFilePath}`;

      const tests = await model.invoke(prompt);
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFilePath, String(tests), "utf-8");
      generatedTests.push(testFilePath);
    }
    return generatedTests;
  } catch (error) {
    return generatedTests;
  }
}