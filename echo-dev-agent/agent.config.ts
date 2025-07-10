export const config = {
  repoOwner: process.env.REPO_OWNER || "ultracoolbru",
  repoName: process.env.REPO_NAME || "echo",
  branchPrefix: "agent-fix/",
  excludePaths: ["node_modules", "dist", "build", ".next"],
  useOpenAI: true,
  openaiModel: "gpt-4o",
  baseBranch: "main",
  memoryPath: process.env.MEMORY_PATH || "./tasks/index",
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  taskQueuePath: "./tasks/queue.json",
  openaiEmbeddingModel: "text-embedding-3-small"
};