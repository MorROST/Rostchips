import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().describe('Ingredient name in the source language'),
  nameHe: z.string().optional().describe('Ingredient name in Hebrew (if source is not Hebrew)'),
  amount: z.string().describe('Quantity (e.g., "2", "1/2", "a pinch")'),
  unit: z.string().describe('Unit of measurement (e.g., "cups", "tbsp", "pieces", or empty string)'),
});

export const recipeExtractionSchema = z.object({
  title: z.string().describe('Recipe title in the source language'),
  titleHe: z.string().optional().describe('Recipe title in Hebrew'),
  description: z.string().optional().describe('Brief description of the dish'),
  descriptionHe: z.string().optional().describe('Brief description in Hebrew'),
  ingredients: z.array(ingredientSchema).describe('List of all ingredients with quantities'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions in source language'),
  instructionsHe: z.array(z.string()).optional().describe('Instructions translated to Hebrew'),
  prepTime: z.number().optional().describe('Preparation time in minutes'),
  cookTime: z.number().optional().describe('Cooking time in minutes'),
  servings: z.number().optional().describe('Number of servings'),
  tags: z.array(z.string()).describe('Tags like "vegetarian", "quick", "dessert", etc.'),
  sourceLanguage: z.string().describe('ISO 639-1 language code of the source (e.g., "en", "he")'),
});

export type RecipeExtraction = z.infer<typeof recipeExtractionSchema>;
