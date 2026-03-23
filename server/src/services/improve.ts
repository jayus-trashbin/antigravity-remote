import Anthropic from '@anthropic-ai/sdk';
import { config, ANTHROPIC_API_KEY } from '../config.js';

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

interface ImproveOptions {
  prompt: string;
  mode?: 'detailed' | 'concise' | 'technical' | 'creative';
  context?: {
    openFiles?: string[];
    gitBranch?: string;
    recentChanges?: string;
  };
}

interface ImproveResult {
  original: string;
  improved: string;
  model: string;
}

const MODE_INSTRUCTIONS: Record<string, string> = {
  detailed: 'Expand the prompt with technical details, specific file paths if relevant, and clear acceptance criteria.',
  concise: 'Make the prompt shorter and more direct. Remove ambiguity. Keep only what is essential.',
  technical: 'Use precise technical language. Reference specific functions, types, or patterns when helpful.',
  creative: 'Keep the spirit of the request but phrase it to encourage creative, elegant solutions.',
};

export async function improvePrompt(options: ImproveOptions): Promise<ImproveResult> {
  const { prompt, mode = 'detailed', context } = options;

  const contextBlock = context
    ? `
Project context:
- Open files: ${context.openFiles?.join(', ') || 'none'}
- Git branch: ${context.gitBranch || 'unknown'}
- Recent changes: ${context.recentChanges || 'none'}
`.trim()
    : '';

  const systemPrompt = `You are a prompt engineer for AI coding agents.
Rewrite the user's coding request to be clearer and more actionable.
Mode: ${mode} — ${MODE_INSTRUCTIONS[mode]}
${contextBlock}
Rules:
- Preserve the user's intent exactly. Do NOT add tasks they didn't ask for.
- Reference specific file paths only if they appear in context.
- Output ONLY the improved prompt. No explanation, no preamble.`;

  const message = await client.messages.create({
    model: config.improveModel,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const improved = (message.content[0] as { text: string }).text.trim();

  return {
    original: prompt,
    improved,
    model: config.improveModel,
  };
}
