import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { OpenAI } from 'openai';

import { createSetlist } from './util/spotify'

const app = new Hono()
// レスポンスの型定義
interface SongResponse {
  playlist_name: string;
  songs: {
    artist_name: string;
    song_name: string;
  }[];
}

app.use('*', cors())

app.use('*', logger())


app.get('/', (c) => {
  return c.text(`Hello Hono!`)
})

// Spotify APIエンドポイント
app.get('/api/spotify', async (c) => {
  const userId = "user_2wvok3306il4XKyV56Xr82yNkc3"
  const { CLERK_API_KEY } = env<{ CLERK_API_KEY: string }>(c)

  try {
    // Clerk APIを呼び出してSpotifyのアクセストークンを取得
    const clerkResponse = await fetch(
      `https://api.clerk.dev/v1/users/${userId}/oauth_access_tokens/spotify`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tokenData = await clerkResponse.json() as Record<string, any>;
    console.log("tokenDataaaa", JSON.stringify(tokenData, null, 2));

    const spotifyAccessToken = tokenData[0].token;

    console.log("spotifyAccessToken", spotifyAccessToken);

    // Spotify APIを呼び出す
    const spotifyResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!spotifyResponse.ok) {
      const error = await spotifyResponse.json();
      console.error('Spotify APIエラー:', error);
      return c.json({ error: 'Spotifyデータの取得に失敗しました' }, 400);
    }

    const spotifyData = await spotifyResponse.json();

    return c.json({ user: spotifyData });
  } catch (error) {
    console.error('サーバーエラー:', error);
    return c.json({ error: '内部サーバーエラー' }, 500);
  }
});

app.post('/submit', async (c) => {
  const { OPENAI_API_KEY } = env<{ OPENAI_API_KEY: string }>(c)
  const body = await c.req.json()
  const prompt = body.prompt
  // APIキーの確認
  if (!OPENAI_API_KEY) {
    console.error('環境変数にOPENAI_API_KEYが設定されていません');
    return;
  }

  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    const response = await client.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [
        {
          role: "system",
          content: "あなたはユーザ入力から適切な音楽をサジェストするプロンプトジェネレータです．あなたの最新知識を駆使して，ユーザの入力に応じた適切な音楽をサジェストしてください．出力はアーティスト名，曲名をJSON形式で出力してください．また，プロンプトから適切なプレイリスト名を生成すること．",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Spotify_Songs",
          strict: true,
          schema: {
            type: "object",
            properties: {
              playlist_name: { type: "string" },
              songs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    artist_name: { type: "string" },
                    song_name: { type: "string" },
                  },
                  additionalProperties: false,
                  required: ["artist_name", "song_name"],
                },
              },
            },
            required: ["songs", "playlist_name"],
            additionalProperties: false,
          },
        },
      },
    });

    // レスポンスを取得
    const songData = JSON.parse(response.choices[0].message.content || '{}') as SongResponse;

    const queries: string[] = songData.songs.map((song) => {
      const query = `${song.artist_name} - ${song.song_name}`
      return query
    })
    const playlist_name = songData.playlist_name

    const { SPOTIFY_USERNAME, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = env<{ SPOTIFY_USERNAME: string, SPOTIFY_CLIENT_ID: string, SPOTIFY_CLIENT_SECRET: string, SPOTIFY_REFRESH_TOKEN: string }>(c)

    const spotifyEnv = {
      SPOTIFY_USERNAME,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN
    }

    const setlist_id = await createSetlist(queries, playlist_name, spotifyEnv)

    console.log(JSON.stringify(queries, null, 2));

    console.log(JSON.stringify(setlist_id, null, 2));


    return c.json(setlist_id)

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }

})

export default app
