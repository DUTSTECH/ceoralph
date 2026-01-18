/**
 * Get Output Tool
 * 
 * Get the full output from a completed task.
 */

export interface TaskOutput {
  taskId: string;
  found: boolean;
  status?: "pending" | "running" | "completed" | "failed";
  output?: string;
  error?: string;
  tokensUsed?: number;
}

export function getOutput(
  activeTasks: Map<string, {
    status: "pending" | "running" | "completed" | "failed";
    startTime: Date;
    output?: string;
    error?: string;
    tokensUsed?: number;
  }>,
  taskId: string
): TaskOutput {
  const task = activeTasks.get(taskId);

  if (!task) {
    return {
      taskId,
      found: false,
    };
  }

  return {
    taskId,
    found: true,
    status: task.status,
    output: task.output,
    error: task.error,
    tokensUsed: task.tokensUsed,
  };
}
