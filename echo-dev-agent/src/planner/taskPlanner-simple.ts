import { ChatOpenAI } from "@langchain/openai";
import { config } from "../../agent.config";

export async function planTask(task: string): Promise<string> {
    const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.4 });

    // For now, we'll work without the vector store to avoid the compatibility issue
    console.log("📝 Planning task without vector store (simplified mode)...");

    const prompt = `Analyze and plan this dev task for the Echo project: "${task}".

Based on the Echo project structure which includes:
- CLI tools and commands
- Agent functionality with LLM integration
- MongoDB data storage
- Git integration
- Task management
- Development agent capabilities

Return a clear, numbered list of steps and include relevant filenames or components that would likely be involved.`;

    const result = await model.invoke([{ role: "user", content: prompt }]);

    return result.content as string;
}
