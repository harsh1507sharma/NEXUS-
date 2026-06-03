import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const getagentmodel = () => {
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

    const model = process.env.OPENROUTER_DEFAULT_MODEL ?? 'openai/gpt-4o-mini';

    return openrouter(model);
}