// Spotify API操作
import { SpotifyEnv, Song, PlaylistResponse } from '../types';

let accessToken = '';

/**
 * Spotifyアクセストークンを更新
 */
export async function refreshToken(env: SpotifyEnv) {
  const authEncoded = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authEncoded}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': env.SPOTIFY_REFRESH_TOKEN
    })
  });
  
  const data = await response.json();
  return accessToken = data.access_token;
}

/**
 * ユーザープロフィール取得
 */
export async function getUserProfile(token: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Spotify API Error: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * 保存済みトラック取得
 */
export async function getSavedTracks(token: string, limit = 20) {
  const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Spotify API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.items.map((item: any) => ({
    name: item.track.name,
    artist: item.track.artists[0].name,
    formatted: `${item.track.name} - ${item.track.artists[0].name}`
  }));
}

/**
 * 曲検索
 */
export async function searchSong(query: string): Promise<string> {
  const encodedQuery = encodeURIComponent(query);
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1&market=JP`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const data = await response.json();
  
  if (!data.tracks?.items?.length) {
    console.warn(`No tracks found for query: ${query}`);
    return '';
  }
  
  return data.tracks.items[0].id;
}

/**
 * プレイリスト作成
 */
export async function createPlaylist(
  name: string,
  trackQueries: string[],
  env: SpotifyEnv
): Promise<PlaylistResponse> {
  try {
    await refreshToken(env);
    
    // プレイリスト作成
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${env.SPOTIFY_USERNAME}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          public: true,
          description: 'Created with AI Playlist Generator'
        })
      }
    );
    
    const playlist = await playlistResponse.json();
    console.log(playlist);
    
    // 曲のIDを取得
    const trackIdPromises = trackQueries.map(query => searchSong(query));
    const trackIds = (await Promise.all(trackIdPromises)).filter(Boolean);
    
    // プレイリストに曲を追加
    if (trackIds.length > 0) {
      await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackIds.map(id => `spotify:track:${id}`)
        })
      });
    }
    
    return {
      id: playlist.id,
      url: `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`,
      external_url: `https://open.spotify.com/playlist/${playlist.id}`,
      name
    };
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}