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
export declare function getOutput(activeTasks: Map<string, {
    status: "pending" | "running" | "completed" | "failed";
    startTime: Date;
    output?: string;
    error?: string;
    tokensUsed?: number;
}>, taskId: string): TaskOutput;
//# sourceMappingURL=get-output.d.ts.map