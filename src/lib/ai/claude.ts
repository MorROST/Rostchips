import Anthropic from '@anthropic-ai/sdk';
import type { ExtractionResult } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given a transcript from a cooking video, extract a structured recipe.

Rules:
- Extract ALL ingredients mentioned, with quantities. If quantities are not explicitly stated, estimate reasonable amounts.
- Write clear, numbered step-by-step cooking instructions.
- If the source is in English, also provide Hebrew translations for the title and instructions.
- If the source is in Hebrew, also provide English translations for the title and instructions.
- Detect the source language of the transcript.
- Assign relevant tags (e.g., "vegetarian", "quick", "dessert", "Israeli", "Italian", etc.)
- If prep time, cook time, or servings are mentioned or can be estimated, include them.
- Keep descriptions concise but informative.`;

export async function extractRecipeFromTranscript(
  transcript: string
): Promise<ExtractionResult> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract a structured recipe from this video transcript:\n\n${transcript}`,
      },
    ],
    tools: [
      {
        name: 'save_recipe',
        description: 'Save the extracted recipe with all structured fields',
        input_schema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'Recipe title in source language' },
            titleHe: { type: 'string', description: 'Recipe title in Hebrew' },
            description: { type: 'string', description: 'Brief description' },
            descriptionHe: { type: 'string', description: 'Description in Hebrew' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  nameHe: { type: 'string' },
                  amount: { type: 'string' },
                  unit: { type: 'string' },
                },
                required: ['name', 'amount', 'unit'],
              },
            },
            instructions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Step-by-step instructions in source language',
            },
            instructionsHe: {
              type: 'array',
              items: { type: 'string' },
              description: 'Instructions in Hebrew',
            },
            prepTime: { type: 'number', description: 'Prep time in minutes' },
            cookTime: { type: 'number', description: 'Cook time in minutes' },
            servings: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            sourceLanguage: { type: 'string', description: 'ISO 639-1 code' },
          },
          required: ['title', 'ingredients', 'instructions', 'tags', 'sourceLanguage'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'save_recipe' },
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return structured recipe data');
  }

  const data = toolUse.input as ExtractionResult;
  return data;
}
