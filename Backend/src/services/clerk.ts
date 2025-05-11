// Clerk API操作
import { SpotifyEnv } from '../types';

/**
 * ClerkからSpotifyアクセストークンを取得
 */
export async function getUserSpotifyToken(userId: string, env: Pick<SpotifyEnv, 'CLERK_API_KEY'>) {
  try {
    const response = await fetch(
      `https://api.clerk.dev/v1/users/${userId}/oauth_access_tokens/spotify`,
      {
        headers: {
          Authorization: `Bearer ${env.CLERK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Clerk API Error: ${response.status}`);
    }

    const data = await response.json() as Record<string, any>;
    
    if (Array.isArray(data)) {
      return data[0]?.token;
    } else if ('data' in data && Array.isArray(data.data)) {
      return data.data[0]?.token;
    } else if ('token' in data) {
      return data.token;
    }
    
    throw new Error('Invalid token format from Clerk API');
  } catch (error) {
    console.error('Clerk API error:', error);
    throw error;
  }
}