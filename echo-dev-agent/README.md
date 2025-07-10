# 🛠️ Echo Dev Agent

An autonomous AI development agent that can analyze, repair, and enhance the `echo` project using GPT-4o, now with **auto-test generation**.

## ⚙️ Prerequisites

- Node.js 18+
- Git installed and linked to the `echo` repo
- `.env` file with:

```
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXX
REPO_OWNER=ultracoolbru
REPO_NAME=echo
```

- Dev dependencies:

```bash
npm install --save-dev jest ts-jest @types/jest
```

## 🚀 Running the Agent

```bash
npx tsx index.ts "Fix dark mode toggle"
```

The agent will:
1. Embed the codebase to memory
2. Generate a plan using GPT-4o
3. Modify relevant files
4. **Auto-generate Jest tests** for changed files
5. Run tests with `jest`
6. Commit changes
7. Create a pull request with summary


### 🧠 Semantic PR Enhancements

When the AI Dev Agent completes a task and creates a PR, it now:
- Generates a short, clear **PR title**
- Writes a professional **PR description**
- Assigns **semantic labels** like `bug`, `feature`, `refactor`, `test`, or `docs`


---

## 🧠 Semantic PR Summaries and Labels

As of Phase 4, the agent now:
- Writes a clean, human-readable PR summary
- Automatically applies semantic labels such as:
  - `bug`
  - `enhancement`
  - `refactor`
  - `test`

These are generated using GPT-4o based on the code and file changes.


---

## 📋 Task Queue System (Phase 5)

You can now queue up multiple dev tasks using:

```ts
import { enqueueTask } from './src/utils/taskQueue';
enqueueTask("Fix dark mode bug");
enqueueTask("Add new sidebar toggle");
```

Then run all tasks in order using:

```bash
npx tsx runQueue.ts
```

Each task will be processed one after the other with full AI automation.


---

## 🤖 Telegram Command Bot (Phase 6)

You can now control the Echo Dev Agent via Telegram:

### Commands

- `/fix <task>` – Add task to queue
- `/status` – View task status
- `/cancel <task #>` – Cancel a specific task
- `/run` – Execute all pending tasks
- `/help` – Show bot command menu

### Setup

Add these to your `.env`:

```
TELEGRAM_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

Run the bot:

```bash
npx tsx src/agents/telegramBot.ts
```
