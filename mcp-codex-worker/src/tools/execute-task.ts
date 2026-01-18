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

export async function executeTask(
  codexClient: CodexClient,
  contextBuilder: ContextBuilder,
  taskId: string,
  contextPackage: Partial<ContextPackage> & { task: ContextPackage['task'] },
  mode: "advisory" | "implementation"
): Promise<ExecuteTaskResult> {
  // Build the full context package
  const ctx: ContextPackage = {
    taskId,
    task: contextPackage.task,
    files: contextPackage.files,
    design: contextPackage.design,
    constraints: contextPackage.constraints,
    previousAttempts: contextPackage.previousAttempts,
    workingDirectory: contextPackage.workingDirectory,
    commitPrefix: contextPackage.commitPrefix,
  };

  // Validate the context
  const validation = contextBuilder.validate(ctx);
  if (!validation.valid) {
    throw new Error(`Invalid context package: ${validation.errors.join(", ")}`);
  }

  // Build the task prompt
  const taskPrompt = contextBuilder.buildTaskPrompt(ctx);

  // Generate system prompt
  const systemPrompt = CodexClient.generateSystemPrompt(
    ctx.workingDirectory || process.cwd()
  );

  // Execute via Codex
  const response = await codexClient.executeTask(systemPrompt, taskPrompt, mode);

  // Parse the response
  const filesModified = CodexClient.parseFileModifications(response.content);
  const hasCompletion = CodexClient.hasCompletionSignal(response.content);
  const blockStatus = CodexClient.isBlocked(response.content);

  // Determine signal
  let signal: "TASK_COMPLETE" | "TASK_BLOCKED" | "NO_SIGNAL";
  if (blockStatus.blocked) {
    signal = "TASK_BLOCKED";
  } else if (hasCompletion) {
    signal = "TASK_COMPLETE";
  } else {
    signal = "NO_SIGNAL";
  }

  return {
    success: signal === "TASK_COMPLETE",
    output: response.content,
    filesModified,
    tokensUsed: response.tokensUsed.total,
    signal,
    blockReason: blockStatus.reason,
  };
}
