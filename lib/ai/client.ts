import OpenAI from 'openai';

export function getDeepSeekClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
  });
}

const MODEL_FALLBACK_CHAIN = [
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-120b:free',
];

export async function createChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, 'model'>
): Promise<{ completion: OpenAI.Chat.ChatCompletion; model: string }> {
  const client = getDeepSeekClient();
  let lastErr: unknown;
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const completion = await client.chat.completions.create({ ...params, model });
      return { completion, model };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 404 || status === 429) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
