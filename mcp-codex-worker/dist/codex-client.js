/**
 * Codex Client
 *
 * Wrapper around OpenAI API for communicating with GPT/Codex models.
 * Handles prompt construction, API calls, and response parsing.
 */
import OpenAI from "openai";
export class CodexClient {
    client;
    model;
    maxTokens;
    temperature;
    constructor(config) {
        this.client = new OpenAI({
            apiKey: config.apiKey,
        });
        this.model = config.model;
        this.maxTokens = config.maxTokens;
        this.temperature = config.temperature ?? 0.2; // Lower temperature for more consistent code
    }
    /**
     * Send a task to Codex for implementation
     */
    async executeTask(systemPrompt, taskPrompt, mode) {
        const modeInstruction = mode === "advisory"
            ? "\n\nYou are in ADVISORY mode. Analyze and provide recommendations only. Do NOT output file modifications."
            : "\n\nYou are in IMPLEMENTATION mode. Implement the task and output the complete file contents for any files you create or modify.";
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt + modeInstruction,
                },
                {
                    role: "user",
                    content: taskPrompt,
                },
            ],
            max_tokens: this.maxTokens,
            temperature: this.temperature,
        });
        const choice = response.choices[0];
        return {
            content: choice.message.content || "",
            tokensUsed: {
                prompt: response.usage?.prompt_tokens || 0,
                completion: response.usage?.completion_tokens || 0,
                total: response.usage?.total_tokens || 0,
            },
            finishReason: choice.finish_reason || "unknown",
        };
    }
    /**
     * Generate the system prompt for Codex workers
     */
    static generateSystemPrompt(workingDirectory) {
        return `You are a skilled software developer working as part of a team. You receive specific tasks from your manager (Claude) and implement them precisely.

## Your Role
- You are a WORKER, not a decision maker
- Implement exactly what is specified in the task
- Follow the patterns and constraints provided
- Signal completion clearly when done

## Working Directory
${workingDirectory}

## Output Format
When implementing code, use this format for each file:

### FILE: {relative/path/to/file.ext}
\`\`\`{language}
{complete file contents}
\`\`\`

## Rules
1. NEVER deviate from the task specification
2. ALWAYS follow the patterns shown in the context files
3. ALWAYS include complete file contents, not snippets
4. NEVER use placeholder comments like "// rest of the code"
5. ALWAYS signal completion with: TASK_COMPLETE

## If Blocked
If you cannot complete the task, output:
TASK_BLOCKED: {reason}

Do NOT output TASK_COMPLETE if you are blocked.`;
    }
    /**
     * Parse the response to extract file modifications
     */
    static parseFileModifications(content) {
        const files = [];
        // Match pattern: ### FILE: path\n```language\ncontent\n```
        const filePattern = /### FILE: ([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
        let match;
        while ((match = filePattern.exec(content)) !== null) {
            files.push({
                path: match[1].trim(),
                language: match[2] || "text",
                content: match[3],
            });
        }
        return files;
    }
    /**
     * Check if the response signals completion
     */
    static hasCompletionSignal(content) {
        return content.includes("TASK_COMPLETE");
    }
    /**
     * Check if the response signals a block
     */
    static isBlocked(content) {
        const blockMatch = content.match(/TASK_BLOCKED:\s*(.+)/);
        if (blockMatch) {
            return { blocked: true, reason: blockMatch[1].trim() };
        }
        return { blocked: false };
    }
}
//# sourceMappingURL=codex-client.js.map