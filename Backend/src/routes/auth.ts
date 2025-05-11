// 認証関連ルート
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { getUserSpotifyToken } from '../services/clerk';

const app = new Hono();

/**
 * Spotifyトークン取得エンドポイント
 */
app.get('/spotify-token', async (c) => {
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ success: false, error: 'ユーザーIDが必要です' }, 400);
  }
  
  try {
    const { CLERK_API_KEY } = env<{ CLERK_API_KEY: string }>(c);
    const token = await getUserSpotifyToken(userId, { CLERK_API_KEY });
    
    return c.json({ success: true, token });
  } catch (error) {
    console.error('Token error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }, 500);
  }
});

export default app;