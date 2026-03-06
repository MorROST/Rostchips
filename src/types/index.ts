export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook';

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Ingredient {
  name: string;
  nameHe?: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  userId: string;
  url: string;
  platform: Platform;
  title: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  ingredients: Ingredient[];
  instructions: string[];
  instructionsHe?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags: string[];
  thumbnailUrl?: string;
  embedHtml?: string;
  extractionStatus: ExtractionStatus;
  sourceLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  preferredLanguage: 'en' | 'he';
}

export interface OEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
  provider_name?: string;
}

export interface TranscriptSegment {
  text: string;
  offset?: number;
  duration?: number;
}

export interface ExtractionResult {
  title: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  ingredients: Ingredient[];
  instructions: string[];
  instructionsHe?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags: string[];
  sourceLanguage: string;
}
