import "dotenv/config";
import { runMultiAgent } from "./src/agents/multiAgent";

async function main() {
  const task = process.argv[2];
  if (!task) {
    console.error("❌ Please provide a task, e.g., `tsx index.ts \"Fix login bug\"`");
    process.exit(1);
  }

  await runMultiAgent(task);
}

main();
