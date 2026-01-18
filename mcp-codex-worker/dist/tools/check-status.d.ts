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
export declare function checkStatus(activeTasks: Map<string, {
    status: "pending" | "running" | "completed" | "failed";
    startTime: Date;
    output?: string;
    error?: string;
    tokensUsed?: number;
}>, taskId: string): TaskStatus;
//# sourceMappingURL=check-status.d.ts.map