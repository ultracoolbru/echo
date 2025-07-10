import { executePlan } from "../executor/codeExecutor";
import { runTests } from "../executor/testRunner";
import { createPullRequest } from "../github/prCreator";
import { planTask } from "../planner/taskPlanner-enhanced";

/**
 * Executes a full AI development pipeline: plan → edit → review → PR
 */
export async function runMultiAgent(task: string) {
  console.log("🤖 Agent 1: Planning");
  const plan = await planTask(task);
  console.log("✅ Plan:", plan);

  console.log("🛠️ Agent 2: Editing Code");
  const modifiedFiles = await executePlan(task, plan);
  if (modifiedFiles.length === 0) {
    console.log("⚠️ No files changed, exiting.");
    return;
  }

  console.log("🔬 Agent 3: Reviewing via Tests");
  const passed = await runTests(modifiedFiles);
  if (!passed) {
    console.error("❌ Tests failed. Skipping PR.");
    return;
  }

  console.log("📦 Agent 4: Creating Pull Request");
  await createPullRequest(task, modifiedFiles);
}
