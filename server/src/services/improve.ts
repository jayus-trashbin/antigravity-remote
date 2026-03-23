import { config } from '../config.js';

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

// Ollama configuration
const OLLAMA_BASE_URL = config.ollamaUrl || 'http://localhost:11434';
const OLLAMA_MODEL = config.ollamaModel || 'deepseek-coder';

async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: userPrompt,
      system: systemPrompt,
      stream: false,
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 512,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response.trim();
}

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

  const improved = await callOllama(systemPrompt, prompt);

  return {
    original: prompt,
    improved,
    model: OLLAMA_MODEL,
  };
}
