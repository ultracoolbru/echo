import { ChatOpenAI } from "@langchain/openai";
import { Octokit } from "@octokit/rest";
import { execSync } from "child_process";
import { config } from "../../agent.config";

export async function createPullRequest(task: string, modifiedFiles: string[]) {
  const branchName = `${config.branchPrefix}${Date.now()}`;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const model = new ChatOpenAI({ modelName: config.openaiModel, temperature: 0.4 });

  execSync(`git checkout -b ${branchName}`);
  execSync(`git add ${modifiedFiles.join(" ")}`);
  execSync(`git commit -m "🛠️ Agent: ${task}"`);
  execSync(`git push origin ${branchName}`);

  const prPrompt = `
You are summarizing a GitHub pull request.
Task: ${task}
Files changed:
${modifiedFiles.join("\n")}

1. Write a clear 3–5 line summary for this PR.
2. Suggest one or more semantic GitHub labels (e.g. bug, enhancement, refactor, test).
3. Return your result in this format:

---
**Summary**
<summary text>

**Labels**
<label1>, <label2>
`;

  const output = await model.invoke(prPrompt);

  // Ensure outputText is always a string
  let outputText: string;
  if (typeof output === "string") {
    outputText = output;
  } else if (Array.isArray(output)) {
    outputText = output.map(item => (typeof item === "string" ? item : (item.content ?? item.text ?? ""))).join("\n");
  } else {
    // Handle if content or text is an array (MessageContentComplex[])
    const content = output.content ?? output.text ?? "";
    if (Array.isArray(content)) {
      outputText = content.map(item => (typeof item === "string" ? item : "")).join("\n");
    } else {
      outputText = content;
    }
  }

  const summaryMatch = outputText.match(/\*\*Summary\*\*[\s\n]*([\s\S]*?)\n\*\*Labels\*\*/);
  const labelsMatch = outputText.match(/\*\*Labels\*\*[\s\n]*([\w,\s\-]+)/);

  const summary = summaryMatch ? summaryMatch[1].trim() : "AI-generated update.";
  const labels = labelsMatch ? labelsMatch[1].split(",").map(s => s.trim()) : [];

  const pr = await octokit.pulls.create({
    owner: config.repoOwner,
    repo: config.repoName,
    title: `🛠️ Agent: ${task}`,
    head: branchName,
    base: config.baseBranch,
    body: summary
  });

  if (labels.length > 0) {
    await octokit.issues.addLabels({
      owner: config.repoOwner,
      repo: config.repoName,
      issue_number: pr.data.number,
      labels
    });
  }

  console.log(`✅ Pull Request created: ${pr.data.html_url}`);
}
