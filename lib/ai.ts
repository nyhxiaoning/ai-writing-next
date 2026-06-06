import OpenAI from 'openai';

export interface AIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export function createAIClient(config: AIConfig) {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
    dangerouslyAllowBrowser: true,
  });
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Non-streaming completion */
export async function generateChat(config: AIConfig, messages: ChatMessage[]) {
  const client = createAIClient(config);
  const res = await client.chat.completions.create({
    model: config.model || 'gpt-4o',
    messages,
    temperature: 0.8,
  });
  return res.choices[0]?.message?.content || '';
}

/** Streaming completion — calls onStream for each token */
export async function* streamChat(
  config: AIConfig,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const client = createAIClient(config);
  const stream = await client.chat.completions.create({
    model: config.model || 'gpt-4o',
    messages,
    temperature: 0.8,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
