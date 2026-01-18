/**
 * Context Builder
 *
 * Builds context packages for Codex workers. Extracts relevant information
 * from the spec files and prepares focused context for task execution.
 */
export interface ContextPackage {
    taskId: string;
    task: {
        title: string;
        do: string;
        doneWhen: string;
        acceptance?: string[];
    };
    files?: Record<string, {
        path: string;
        content: string;
        language?: string;
        relevantSections?: Array<{
            startLine: number;
            endLine: number;
            description: string;
        }>;
    }>;
    design?: {
        architecture?: string;
        patterns?: string[];
        apis?: Array<{
            endpoint: string;
            method: string;
            description: string;
        }>;
    };
    constraints?: string[];
    previousAttempts?: Array<{
        attempt: number;
        feedback: string;
        issues?: string[];
    }>;
    workingDirectory?: string;
    commitPrefix?: string;
}
export declare class ContextBuilder {
    /**
     * Build a prompt from a context package
     */
    buildTaskPrompt(ctx: ContextPackage): string;
    /**
     * Extract relevant sections from a file based on line ranges
     */
    extractRelevantSections(content: string, sections: Array<{
        startLine: number;
        endLine: number;
    }>): string;
    /**
     * Truncate content to fit within token limits
     * Rough estimate: 4 characters per token
     */
    truncateToTokenLimit(content: string, maxTokens: number): string;
    /**
     * Validate a context package
     */
    validate(ctx: ContextPackage): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=context-builder.d.ts.map