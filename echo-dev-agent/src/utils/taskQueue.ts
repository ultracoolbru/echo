import fs from "fs";
import path from "path";

const QUEUE_FILE = path.resolve("./tasks/task-queue.json");

export function enqueueTask(task: string) {
  const queue = loadQueue();
  queue.push({ task, status: "pending", timestamp: new Date().toISOString() });
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

export function loadQueue(): { task: string; status: string; timestamp: string }[] {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  const raw = fs.readFileSync(QUEUE_FILE, "utf-8");
  return JSON.parse(raw);
}

export function saveQueue(queue: any[]) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

export async function runTaskQueue(runner: (task: string) => Promise<void>) {
  const queue = loadQueue();
  for (const entry of queue.filter(t => t.status === "pending")) {
    console.log(`🧾 Running task: ${entry.task}`);
    entry.status = "running";
    saveQueue(queue);
    try {
      await runner(entry.task);
      entry.status = "done";
    } catch (err) {
      entry.status = "error";
    }
    saveQueue(queue);
  }
}
