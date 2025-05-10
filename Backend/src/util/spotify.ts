// 環境変数を型定義
interface SpotifyEnv {
  SPOTIFY_USERNAME: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
}

let accessToken = '';

// 環境変数を引数として受け取るようにrefreshToken関数を修正
async function refreshToken(spotifyEnv: SpotifyEnv) {
  const clientId = spotifyEnv.SPOTIFY_CLIENT_ID;
  const clientSecret = spotifyEnv.SPOTIFY_CLIENT_SECRET;
  const refreshToken = spotifyEnv.SPOTIFY_REFRESH_TOKEN;

  const authEncoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const authHeaders = {
    'Authorization': `Basic ${authEncoded}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const authData = new URLSearchParams({
    'grant_type': 'refresh_token',
    'refresh_token': refreshToken
  });

  const authUrl = 'https://accounts.spotify.com/api/token';
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: authHeaders,
    body: authData
  });
  const data: any = await response.json();
  return accessToken = data.access_token;
}

export async function createSetlist(queries: string[], spotifyEnv: SpotifyEnv) {
  try {
    await refreshToken(spotifyEnv);
    console.log(queries);

    const username = spotifyEnv.SPOTIFY_USERNAME;

    const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${username}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `AI Playlist`,
        public: true
      })
    });
    const playlist: any = await playlistResponse.json();

    // まず全ての曲のtrackIdを取得
    const trackIdPromises: Promise<string>[] = queries.map((query: string) =>
      spSearchSong(query, spotifyEnv)
    );
    const trackIds: string[] = await Promise.all(trackIdPromises);

    // trackIdの順番を保持したまま、プレイリストに追加
    await spAddPlaylist(playlist.id, trackIds);

    console.log(`Playlist created: https://open.spotify.com/playlist/${playlist.id}`);
    return playlist.id;

  } catch (error) {
    console.error('Error submitting setlist:', error);
    return { error: 'プレイリストの作成に失敗しました' };
  }
}

async function spSearchSong(query: string, spotifyEnv: SpotifyEnv): Promise<string> {
  // 特殊文字の前処理
  if (query.startsWith('#')) {
    query = query.slice(1);
  }

  const en_q = encodeURIComponent(`${query}`);
  const q = decodeURIComponent(en_q);
  console.log(`Searching for: ${q}`);
  const response = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=10&market=JP`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data: any = await response.json();
  
  if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
    console.error(`曲が見つかりませんでした: ${query}`);
    return '';
  }
  
  return data.tracks.items[0].id;
}

async function spAddPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
  // 空のIDを除外
  const validTrackIds = trackIds.filter(id => id);
  
  if (validTrackIds.length === 0) {
    console.warn('追加する曲が見つかりませんでした');
    return;
  }
  
  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: validTrackIds.map(id => `spotify:track:${id}`)
    })
  });
}

export async function spGetPlaylist(playlistId: string, spotifyEnv: SpotifyEnv) {
  await refreshToken(spotifyEnv);
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}