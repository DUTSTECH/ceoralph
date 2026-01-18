/**
 * Codex Client
 *
 * Wrapper around OpenAI API for communicating with GPT/Codex models.
 * Handles prompt construction, API calls, and response parsing.
 */
export interface CodexClientConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature?: number;
}
export interface CodexResponse {
    content: string;
    tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
    };
    finishReason: string;
}
export declare class CodexClient {
    private client;
    private model;
    private maxTokens;
    private temperature;
    constructor(config: CodexClientConfig);
    /**
     * Send a task to Codex for implementation
     */
    executeTask(systemPrompt: string, taskPrompt: string, mode: "advisory" | "implementation"): Promise<CodexResponse>;
    /**
     * Generate the system prompt for Codex workers
     */
    static generateSystemPrompt(workingDirectory: string): string;
    /**
     * Parse the response to extract file modifications
     */
    static parseFileModifications(content: string): Array<{
        path: string;
        content: string;
        language: string;
    }>;
    /**
     * Check if the response signals completion
     */
    static hasCompletionSignal(content: string): boolean;
    /**
     * Check if the response signals a block
     */
    static isBlocked(content: string): {
        blocked: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=codex-client.d.ts.map