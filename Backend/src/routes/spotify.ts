// Spotify関連ルート
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { getUserSpotifyToken } from '../services/clerk';
import { getUserProfile, getSavedTracks } from '../services/spotify';
import { validateUserId } from '../middleware/auth';

const app = new Hono();

/**
 * ユーザープロフィール取得
 */
app.get('/profile', validateUserId, async (c) => {
  const userId = c.get('userId');
  const { CLERK_API_KEY } = env<{ CLERK_API_KEY: string }>(c);
  
  try {
    // Spotifyトークン取得
    const spotifyToken = await getUserSpotifyToken(userId, { CLERK_API_KEY });
    
    // ユーザープロフィール取得
    const profile = await getUserProfile(spotifyToken);
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Spotify profile error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }, 500);
  }
});

/**
 * 保存済み曲の取得
 */
app.get('/saved-tracks', validateUserId, async (c) => {
  const userId = c.get('userId');
  const { CLERK_API_KEY } = env<{ CLERK_API_KEY: string }>(c);
  const limit = Number(c.req.query('limit') || '20');
  
  try {
    // Spotifyトークン取得
    const spotifyToken = await getUserSpotifyToken(userId, { CLERK_API_KEY });
    
    // 保存済み曲を取得
    const tracks = await getSavedTracks(spotifyToken, limit);
    
    return c.json({ success: true, tracks });
  } catch (error) {
    console.error('Saved tracks error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }, 500);
  }
});

export default app;