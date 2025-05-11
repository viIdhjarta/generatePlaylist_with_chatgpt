// OpenAI API操作
import { OpenAI } from 'openai';
import { SongResponse } from '../types';

/**
 * プロンプトからプレイリスト推奨曲を生成
 */
export async function generatePlaylistSuggestions(
  prompt: string,
  apiKey: string,
  references?: string[]
): Promise<SongResponse> {
  const client = new OpenAI({ apiKey });
  
  let content = prompt;
  if (references && references.length) {
    content += ` 私のお気に入り曲は ${references.join(', ')} です。`;
  }
  
  const response = await client.chat.completions.create({
    model: "o4-mini-2025-04-16",
    messages: [
      {
        role: "system",
        content: "あなたはユーザ入力から適切な音楽をサジェストするプロンプトジェネレータです。ユーザの入力と好みに応じた適切な音楽をサジェストし、JSONで出力してください。また適切なプレイリスト名も命名すること"
      },
      {
        role: "user",
        content
      }
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
  
  const content_str = response.choices[0].message.content || '{}';
  return JSON.parse(content_str) as SongResponse;
}