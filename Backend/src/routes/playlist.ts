// プレイリスト生成ルート
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { generatePlaylistSuggestions } from '../services/openai';
import { createPlaylist } from '../services/spotify';
import { getUserSpotifyToken } from '../services/clerk';
import { getSavedTracks } from '../services/spotify';
import { validateUserId } from '../middleware/auth';
import { SpotifyEnv } from '../types';

const app = new Hono();

/**
 * プレイリスト生成エンドポイント
 */
app.post('/generate', validateUserId, async (c) => {
  const userId = c.get('userId');
  const { prompt, useFavorites } = await c.req.json<{ 
    prompt: string;
    useFavorites?: boolean;
  }>();
  
  if (!prompt || typeof prompt !== 'string') {
    return c.json({ success: false, error: 'プロンプトが必要です' }, 400);
  }
  
  try {
    // 環境変数取得
    const { 
      OPENAI_API_KEY,
      SPOTIFY_USERNAME, 
      SPOTIFY_CLIENT_ID, 
      SPOTIFY_CLIENT_SECRET, 
      SPOTIFY_REFRESH_TOKEN,
      CLERK_API_KEY
    } = env<{
      OPENAI_API_KEY: string;
      SPOTIFY_USERNAME: string; 
      SPOTIFY_CLIENT_ID: string; 
      SPOTIFY_CLIENT_SECRET: string; 
      SPOTIFY_REFRESH_TOKEN: string;
      CLERK_API_KEY: string;
    }>(c);
    
    const spotifyEnv: SpotifyEnv = {
      SPOTIFY_USERNAME,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN,
      CLERK_API_KEY
    };
    
    // お気に入り曲を取得（オプション）
    let favoriteTracksPrompt: string[] = [];
    if (useFavorites) {
      const spotifyToken = await getUserSpotifyToken(userId, { CLERK_API_KEY });
      const savedTracks = await getSavedTracks(spotifyToken, 5);
      favoriteTracksPrompt = savedTracks.map(track => track.formatted);
    }
    
    // OpenAIでプレイリスト内容を生成
    const songData = await generatePlaylistSuggestions(
      prompt, 
      OPENAI_API_KEY,
      useFavorites ? favoriteTracksPrompt : undefined
    );

    // 曲のクエリを作成
    const queries = songData.songs.map(song => 
      `${song.artist_name} - ${song.song_name}`
    );

    console.log(queries);

    // Spotifyプレイリストを作成
    const playlist = await createPlaylist(
      songData.playlist_name,
      queries,
      spotifyEnv
    );
    
    return c.json({
      success: true,
      playlist: {
        ...playlist,
        songs: songData.songs
      }
    });
  } catch (error) {
    console.error('プレイリスト生成エラー:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }, 500);
  }
});

export default app;