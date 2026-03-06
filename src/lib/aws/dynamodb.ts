import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig, dynamoConfig } from './config';
import type { Recipe, ExtractionResult } from '@/types';
import { ulid } from 'ulid';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = dynamoConfig.tableName;

export async function createRecipeRecord(
  userId: string,
  url: string,
  platform: string
): Promise<string> {
  const id = ulid();
  const now = new Date().toISOString();

  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `RECIPE#${id}`,
        SK: 'META',
        GSI1PK: `USER#${userId}`,
        GSI1SK: `RECIPE#${now}`,
        id,
        userId,
        url,
        platform,
        extractionStatus: 'processing',
        ingredients: [],
        instructions: [],
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
    })
  );

  return id;
}

export async function updateRecipeWithExtraction(
  id: string,
  extraction: ExtractionResult,
  embedHtml?: string,
  thumbnailUrl?: string
): Promise<void> {
  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `RECIPE#${id}`, SK: 'META' },
      UpdateExpression:
        'SET title = :title, titleHe = :titleHe, description = :desc, descriptionHe = :descHe, ' +
        'ingredients = :ingredients, instructions = :instructions, instructionsHe = :instructionsHe, ' +
        'prepTime = :prepTime, cookTime = :cookTime, servings = :servings, tags = :tags, ' +
        'sourceLanguage = :lang, extractionStatus = :status, embedHtml = :embed, ' +
        'thumbnailUrl = :thumb, updatedAt = :now',
      ExpressionAttributeValues: {
        ':title': extraction.title,
        ':titleHe': extraction.titleHe ?? null,
        ':desc': extraction.description ?? null,
        ':descHe': extraction.descriptionHe ?? null,
        ':ingredients': extraction.ingredients,
        ':instructions': extraction.instructions,
        ':instructionsHe': extraction.instructionsHe ?? null,
        ':prepTime': extraction.prepTime ?? null,
        ':cookTime': extraction.cookTime ?? null,
        ':servings': extraction.servings ?? null,
        ':tags': extraction.tags,
        ':lang': extraction.sourceLanguage,
        ':status': 'completed',
        ':embed': embedHtml ?? null,
        ':thumb': thumbnailUrl ?? null,
        ':now': now,
      },
    })
  );
}

export async function markRecipeFailed(
  id: string,
  error?: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `RECIPE#${id}`, SK: 'META' },
      UpdateExpression:
        'SET extractionStatus = :status, extractionError = :err, updatedAt = :now',
      ExpressionAttributeValues: {
        ':status': 'failed',
        ':err': error ?? 'Unknown error',
        ':now': new Date().toISOString(),
      },
    })
  );
}

export async function getUserRecipes(
  userId: string,
  limit = 50,
  lastKey?: Record<string, unknown>
): Promise<{ recipes: Recipe[]; lastKey?: Record<string, unknown> }> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `USER#${userId}` },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const recipes = (result.Items ?? []).map(itemToRecipe);
  return { recipes, lastKey: result.LastEvaluatedKey };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: `RECIPE#${id}`, SK: 'META' },
    })
  );

  return result.Item ? itemToRecipe(result.Item) : null;
}

export async function deleteRecipe(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { PK: `RECIPE#${id}`, SK: 'META' },
    })
  );
}

function itemToRecipe(item: Record<string, unknown>): Recipe {
  return {
    id: item.id as string,
    userId: item.userId as string,
    url: item.url as string,
    platform: item.platform as Recipe['platform'],
    title: (item.title as string) ?? '',
    titleHe: item.titleHe as string | undefined,
    description: item.description as string | undefined,
    descriptionHe: item.descriptionHe as string | undefined,
    ingredients: (item.ingredients as Recipe['ingredients']) ?? [],
    instructions: (item.instructions as string[]) ?? [],
    instructionsHe: item.instructionsHe as string[] | undefined,
    prepTime: item.prepTime as number | undefined,
    cookTime: item.cookTime as number | undefined,
    servings: item.servings as number | undefined,
    tags: (item.tags as string[]) ?? [],
    thumbnailUrl: item.thumbnailUrl as string | undefined,
    embedHtml: item.embedHtml as string | undefined,
    extractionStatus: (item.extractionStatus as Recipe['extractionStatus']) ?? 'pending',
    sourceLanguage: item.sourceLanguage as string | undefined,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}
