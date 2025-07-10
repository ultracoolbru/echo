import { execSync } from "child_process";
import { generateTests } from "./testGenerator";

/**
 * Generates Jest tests and runs them.
 * @param modifiedFiles List of modified files to generate tests for.
 * @returns True if all tests passed.
 */
export async function runTests(modifiedFiles: string[]): Promise<boolean> {
  console.log("[test] Generating tests for modified files...");
  const testFiles = await generateTests(modifiedFiles);
  console.log(`[test] Generated tests: \${testFiles.join(", ")}`);

  console.log("[test] Running Jest tests...");
  try {
    execSync("npx jest --passWithNoTests", { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}