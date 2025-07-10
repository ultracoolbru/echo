import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";
import { config } from "../../agent.config";

export async function embedCodebase(rootDir: string = ".", outDir: string = "./tasks/index") {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100
  });

  const codeFiles: { filePath: string; content: string }[] = [];

  function shouldExclude(p: string): boolean {
    return config.excludePaths.some((exclude) => p.includes(exclude));
  }

  function walk(dir: string) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (shouldExclude(fullPath)) return;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        codeFiles.push({ filePath: fullPath, content });
      }
    });
  }

  walk(rootDir);

  const documents = [];
  for (const { filePath, content } of codeFiles) {
    const splits = await splitter.createDocuments([content], [{ type: "file", value: filePath }]);
    documents.push(...splits);
  }

  const embeddings = new OpenAIEmbeddings({ modelName: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small" });
  const store = await Chroma.fromDocuments(documents, embeddings, {
    collectionName: "echo-memory-v2",
    url: config.chromaUrl || "http://localhost:8000"
  });

  console.log(`[memory] Embedded ${documents.length} chunks from ${codeFiles.length} files.`);
}