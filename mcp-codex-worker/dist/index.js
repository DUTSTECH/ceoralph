#!/usr/bin/env node
/**
 * MCP Codex Worker Server
 *
 * This MCP server provides tools for delegating implementation tasks
 * to OpenAI's GPT/Codex models. It acts as the bridge between Claude (CEO)
 * and GPT (Workers) in the CEO Ralph plugin.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { CodexClient } from "./codex-client.js";
import { ContextBuilder } from "./context-builder.js";
import { executeTask } from "./tools/execute-task.js";
import { checkStatus } from "./tools/check-status.js";
import { getOutput } from "./tools/get-output.js";
// Initialize the MCP server
const server = new Server({
    name: "codex-worker",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Initialize Codex client
const codexClient = new CodexClient({
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.CEO_RALPH_CODEX_MODEL || "gpt-4",
    maxTokens: parseInt(process.env.CEO_RALPH_MAX_TOKENS || "4096"),
});
// Initialize context builder
const contextBuilder = new ContextBuilder();
// Track active tasks
const activeTasks = new Map();
// Define available tools
const tools = [
    {
        name: "execute_task",
        description: "Execute a task using a Codex worker. Sends the context package to GPT and returns the implementation result.",
        inputSchema: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "Unique identifier for the task (e.g., '1.1', '2.3')",
                },
                contextPackage: {
                    type: "object",
                    description: "Full context package for the task including task details, files, design, and constraints",
                    properties: {
                        task: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                do: { type: "string" },
                                doneWhen: { type: "string" },
                                acceptance: { type: "array", items: { type: "string" } },
                            },
                            required: ["title", "do", "doneWhen"],
                        },
                        files: {
                            type: "object",
                            description: "Relevant file contents",
                        },
                        design: {
                            type: "object",
                            description: "Design decisions and patterns",
                        },
                        constraints: {
                            type: "array",
                            items: { type: "string" },
                            description: "Constraints to follow",
                        },
                        previousAttempts: {
                            type: "array",
                            description: "Feedback from previous attempts",
                        },
                        workingDirectory: {
                            type: "string",
                            description: "Working directory for the task",
                        },
                    },
                    required: ["task"],
                },
                mode: {
                    type: "string",
                    enum: ["advisory", "implementation"],
                    description: "Advisory mode is read-only analysis, implementation mode writes files",
                    default: "implementation",
                },
            },
            required: ["taskId", "contextPackage"],
        },
    },
    {
        name: "check_status",
        description: "Check the status of a running or completed task",
        inputSchema: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The task ID to check status for",
                },
            },
            required: ["taskId"],
        },
    },
    {
        name: "get_output",
        description: "Get the full output from a completed task",
        inputSchema: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The task ID to get output for",
                },
            },
            required: ["taskId"],
        },
    },
    {
        name: "cancel_task",
        description: "Cancel a running task",
        inputSchema: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The task ID to cancel",
                },
            },
            required: ["taskId"],
        },
    },
];
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "execute_task": {
                const { taskId, contextPackage, mode = "implementation" } = args;
                // Mark task as running
                activeTasks.set(taskId, {
                    status: "running",
                    startTime: new Date(),
                });
                try {
                    const result = await executeTask(codexClient, contextBuilder, taskId, contextPackage, mode);
                    // Update task status
                    activeTasks.set(taskId, {
                        status: "completed",
                        startTime: activeTasks.get(taskId).startTime,
                        output: result.output,
                        tokensUsed: result.tokensUsed,
                    });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: true,
                                    taskId,
                                    output: result.output,
                                    filesModified: result.filesModified,
                                    tokensUsed: result.tokensUsed,
                                    signal: result.signal,
                                }),
                            },
                        ],
                    };
                }
                catch (error) {
                    activeTasks.set(taskId, {
                        status: "failed",
                        startTime: activeTasks.get(taskId).startTime,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    throw error;
                }
            }
            case "check_status": {
                const { taskId } = args;
                const result = checkStatus(activeTasks, taskId);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }
            case "get_output": {
                const { taskId } = args;
                const result = getOutput(activeTasks, taskId);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }
            case "cancel_task": {
                const { taskId } = args;
                const task = activeTasks.get(taskId);
                if (task && task.status === "running") {
                    activeTasks.set(taskId, {
                        ...task,
                        status: "failed",
                        error: "Cancelled by user",
                    });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ success: true, message: "Task cancelled" }),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ success: false, message: "Task not found or not running" }),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                    }),
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("CEO Ralph Codex Worker MCP server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map