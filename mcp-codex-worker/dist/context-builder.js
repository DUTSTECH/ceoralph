/**
 * Context Builder
 *
 * Builds context packages for Codex workers. Extracts relevant information
 * from the spec files and prepares focused context for task execution.
 */
export class ContextBuilder {
    /**
     * Build a prompt from a context package
     */
    buildTaskPrompt(ctx) {
        const sections = [];
        // Task section
        sections.push(`## Task: ${ctx.task.title}

**What to do**: ${ctx.task.do}

**Done when**: ${ctx.task.doneWhen}`);
        // Acceptance criteria
        if (ctx.task.acceptance && ctx.task.acceptance.length > 0) {
            sections.push(`### Acceptance Criteria
${ctx.task.acceptance.map((ac, i) => `${i + 1}. ${ac}`).join("\n")}`);
        }
        // Relevant files
        if (ctx.files && Object.keys(ctx.files).length > 0) {
            sections.push(`### Context Files

These files are provided for reference. Follow the patterns shown here.`);
            for (const file of Object.values(ctx.files)) {
                let fileSection = `#### ${file.path}`;
                if (file.relevantSections && file.relevantSections.length > 0) {
                    fileSection += `\n_Relevant sections:_`;
                    for (const section of file.relevantSections) {
                        fileSection += `\n- Lines ${section.startLine}-${section.endLine}: ${section.description}`;
                    }
                }
                fileSection += `\n\`\`\`${file.language || "text"}\n${file.content}\n\`\`\``;
                sections.push(fileSection);
            }
        }
        // Design context
        if (ctx.design) {
            const designParts = ["### Design Context"];
            if (ctx.design.architecture) {
                designParts.push(`**Architecture**: ${ctx.design.architecture}`);
            }
            if (ctx.design.patterns && ctx.design.patterns.length > 0) {
                designParts.push(`**Patterns to follow**:\n${ctx.design.patterns.map(p => `- ${p}`).join("\n")}`);
            }
            if (ctx.design.apis && ctx.design.apis.length > 0) {
                designParts.push(`**API endpoints**:`);
                for (const api of ctx.design.apis) {
                    designParts.push(`- ${api.method} ${api.endpoint}: ${api.description}`);
                }
            }
            sections.push(designParts.join("\n\n"));
        }
        // Constraints
        if (ctx.constraints && ctx.constraints.length > 0) {
            sections.push(`### Constraints

You MUST follow these constraints:
${ctx.constraints.map(c => `- ${c}`).join("\n")}`);
        }
        // Previous attempts (for retries)
        if (ctx.previousAttempts && ctx.previousAttempts.length > 0) {
            const lastAttempt = ctx.previousAttempts[ctx.previousAttempts.length - 1];
            sections.push(`### Previous Attempt Feedback

This is attempt #${lastAttempt.attempt + 1}. Previous attempt had these issues:

**Feedback**: ${lastAttempt.feedback}

${lastAttempt.issues ? `**Specific issues to fix**:\n${lastAttempt.issues.map(i => `- ${i}`).join("\n")}` : ""}

Please address these issues in this attempt.`);
        }
        // Commit prefix
        if (ctx.commitPrefix) {
            sections.push(`### Commit Message

Use this prefix for your commit: \`${ctx.commitPrefix}\``);
        }
        // Final instruction
        sections.push(`---

Implement this task now. Output the complete file contents for any files you create or modify using the FILE format. When done, output TASK_COMPLETE on its own line.`);
        return sections.join("\n\n");
    }
    /**
     * Extract relevant sections from a file based on line ranges
     */
    extractRelevantSections(content, sections) {
        const lines = content.split("\n");
        const extractedParts = [];
        for (const section of sections) {
            const start = Math.max(0, section.startLine - 1);
            const end = Math.min(lines.length, section.endLine);
            extractedParts.push(lines.slice(start, end).join("\n"));
        }
        return extractedParts.join("\n\n// ... \n\n");
    }
    /**
     * Truncate content to fit within token limits
     * Rough estimate: 4 characters per token
     */
    truncateToTokenLimit(content, maxTokens) {
        const maxChars = maxTokens * 4;
        if (content.length <= maxChars) {
            return content;
        }
        // Truncate and add indicator
        return content.slice(0, maxChars - 100) + "\n\n... [content truncated for length]";
    }
    /**
     * Validate a context package
     */
    validate(ctx) {
        const errors = [];
        if (!ctx.taskId) {
            errors.push("Missing taskId");
        }
        if (!ctx.task) {
            errors.push("Missing task object");
        }
        else {
            if (!ctx.task.title)
                errors.push("Missing task.title");
            if (!ctx.task.do)
                errors.push("Missing task.do");
            if (!ctx.task.doneWhen)
                errors.push("Missing task.doneWhen");
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
//# sourceMappingURL=context-builder.js.map