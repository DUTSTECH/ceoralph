/**
 * Check Status Tool
 * 
 * Check the status of a running or completed task.
 */

export interface TaskStatus {
  taskId: string;
  status: "pending" | "running" | "completed" | "failed" | "not_found";
  startTime?: string;
  duration?: number;
  error?: string;
}

export function checkStatus(
  activeTasks: Map<string, {
    status: "pending" | "running" | "completed" | "failed";
    startTime: Date;
    output?: string;
    error?: string;
    tokensUsed?: number;
  }>,
  taskId: string
): TaskStatus {
  const task = activeTasks.get(taskId);

  if (!task) {
    return {
      taskId,
      status: "not_found",
    };
  }

  const now = new Date();
  const duration = now.getTime() - task.startTime.getTime();

  return {
    taskId,
    status: task.status,
    startTime: task.startTime.toISOString(),
    duration: Math.round(duration / 1000), // seconds
    error: task.error,
  };
}
