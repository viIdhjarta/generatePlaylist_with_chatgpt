// 共通型定義
export interface SpotifyEnv {
  SPOTIFY_USERNAME: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
  CLERK_API_KEY?: string;
}

export interface Song {
  artist_name: string;
  song_name: string;
}

export interface PlaylistResponse {
  id: string;
  url?: string;
  external_url?: string;
  name: string;
}

export interface SongResponse {
  playlist_name: string;
  songs: Song[];
}