/**
 * Execute Task Tool
 *
 * Executes a task by sending it to the Codex worker and processing the result.
 */
import { CodexClient } from "../codex-client.js";
import { ContextBuilder, ContextPackage } from "../context-builder.js";
export interface ExecuteTaskResult {
    success: boolean;
    output: string;
    filesModified: Array<{
        path: string;
        content: string;
        language: string;
    }>;
    tokensUsed: number;
    signal: "TASK_COMPLETE" | "TASK_BLOCKED" | "NO_SIGNAL";
    blockReason?: string;
}
export declare function executeTask(codexClient: CodexClient, contextBuilder: ContextBuilder, taskId: string, contextPackage: Partial<ContextPackage> & {
    task: ContextPackage['task'];
}, mode: "advisory" | "implementation"): Promise<ExecuteTaskResult>;
//# sourceMappingURL=execute-task.d.ts.map