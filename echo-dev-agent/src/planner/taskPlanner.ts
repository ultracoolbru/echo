import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai/";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { config } from "../../agent.config";

export async function planTask(task: string): Promise<string> {
  const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.4 });

  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings({ modelName: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small" }),
    {
      collectionName: "echo-memory-v2",
      url: config.chromaUrl || "http://localhost:8000"
    }
  );

  const chain = loadQAStuffChain(model);

  const relevantDocs: Document[] = await vectorStore.similaritySearch(task, 6);
  const result = await chain.invoke({
    input_documents: relevantDocs,
    question: `Analyze and plan this dev task for the Echo project: "${task}".
  Return a clear, numbered list of steps and include relevant filenames or components.`
  });

  return result.text;
}