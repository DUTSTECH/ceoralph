/**
 * Get Output Tool
 *
 * Get the full output from a completed task.
 */
export function getOutput(activeTasks, taskId) {
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
//# sourceMappingURL=get-output.js.map