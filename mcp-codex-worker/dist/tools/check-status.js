/**
 * Check Status Tool
 *
 * Check the status of a running or completed task.
 */
export function checkStatus(activeTasks, taskId) {
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
//# sourceMappingURL=check-status.js.map