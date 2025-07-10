import "dotenv/config";
import { runMultiAgent } from "./src/agents/multiAgent";
import { runTaskQueue } from "./src/utils/taskQueue";

runTaskQueue(runMultiAgent);
