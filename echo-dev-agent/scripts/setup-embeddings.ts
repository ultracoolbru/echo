#!/usr/bin/env tsx
import "dotenv/config";
import { embedCodebase } from "../src/memory/embedding";

async function main() {
    console.log("🔄 Setting up embeddings for the codebase...");

    try {
        // Make sure ChromaDB is running
        console.log("📡 Make sure ChromaDB server is running at http://localhost:8000");
        console.log("   You can start it with: chroma run --host localhost --port 8000");

        // Run embedding on the current directory
        await embedCodebase(".", "./tasks/index");

        console.log("✅ Embeddings created successfully!");
        console.log("   Collection: echo-memory-v2");
        console.log("   You can now run: npx tsx index.ts 'analyze the code base'");

    } catch (error) {
        console.error("❌ Error setting up embeddings:", error);
        process.exit(1);
    }
}

main();
