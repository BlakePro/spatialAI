'use server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ollama } from 'ollama-ai-provider';
import { createStreamableValue } from 'ai/rsc';
import { defaultSystemPrompt, defaultSystemPromptResponse, Provider } from '@utilities/defaults';

export async function streamVision(prompt: string, base64Image: string, provider: Provider) {
  try {
    let model: any = null;
    switch (provider) {
      case Provider.openai:
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API });
        model = openai('gpt-3.5-turbo');
        break;
      case Provider.ollama:
        model = ollama('llava');
        break;
    }

    const result = await streamText({
      model: model,
      messages: [
        {
          content: [
            { text: prompt, type: 'text' },
            {
              image: base64Image,
              type: 'image',
            },
          ],
          role: 'user',
        },
      ]
    });

    return createStreamableValue(result.textStream).value;
  } catch (e) {
    console.log(e)
    return null;
  }
}

export async function streamAction(prompt: string, systemPrompt: string, provider: Provider) {
  try {
    let model: any = null;
    switch (provider) {
      case Provider.openai:
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        model = openai('gpt-4o-mini');
        break;
      case Provider.ollama:
        model = ollama('deepseek-coder-v2'); // deepseek-coder-v2 // llama3.1
        break;
    }
    if (systemPrompt == '') systemPrompt = defaultSystemPrompt;
    const system = `${systemPrompt}. ${defaultSystemPromptResponse}`;

    const result = await streamText({
      model: model,
      system: system,
      prompt: prompt,
      onFinish(props) {
        console.log('onFinish')
        //{ text, toolCalls, toolResults, finishReason, usage }
        console.log(props)
        // your own logic, e.g. for saving the chat history or recording usage
      },
    });

    return createStreamableValue(result.textStream).value;
  } catch (e) {
    console.log(e)
    return null
  }
}