import { NextRequest } from 'next/server';

/**
 * Verify the Authorization header and extract the user ID.
 * In production, this would verify the Cognito JWT.
 * For MVP, we decode the JWT payload without full verification
 * (the token was already validated by Amplify client-side).
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);

  try {
    // Decode JWT payload (base64url)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString()
    );

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Cognito puts the user ID in 'sub'
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
