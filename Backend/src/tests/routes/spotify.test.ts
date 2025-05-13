// Backend/src/tests/routes/spotify.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../../index';
import * as clerkService from '../../services/clerk';
import * as spotifyService from '../../services/spotify';
import { env } from 'hono/adapter';
// レスポンスの型定義
type ApiResponse<T> = {
  success: boolean;
  profile?: T;
  tracks?: T;
  error?: string;
};

// モックの設定
vi.mock('../../services/clerk', () => ({
  getUserSpotifyToken: vi.fn()
}));

vi.mock('../../services/spotify', () => ({
  getUserProfile: vi.fn(),
  getSavedTracks: vi.fn()
}));

// Honoのenv関数をモック
vi.mock('hono/adapter', () => ({
  env: vi.fn().mockImplementation(() => ({
    CLERK_API_KEY: 'test-clerk-api-key'
  }))
}));

describe('Spotifyルーターのテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(env).mockImplementation(() => ({
      CLERK_API_KEY: 'test-clerk-api-key'
    }));
  });

  it('プロフィール取得: ユーザーIDがない場合は400エラーを返す', async () => {
    const res = await app.request('/api/v1/spotify/profile');
    expect(res.status).toBe(400);
  });

  it('プロフィール取得: 正常にプロフィール情報を返す', async () => {
    // モックの戻り値を設定
    const mockToken = 'test-spotify-token';
    const mockProfile = { id: 'user123', display_name: 'テストユーザー' };

    vi.mocked(clerkService.getUserSpotifyToken).mockResolvedValue(mockToken);
    vi.mocked(spotifyService.getUserProfile).mockResolvedValue(mockProfile);

    try {
      const res = await app.request('/api/v1/spotify/profile?userId=test123');

      console.log('Response status:', res.status);

      // レスポンスのステータスコードを確認
      expect(res.status).toBe(200);

      // レスポンス内容をテキストとして取得してからJSONとしてパース
      const text = await res.text();
      console.log('Response text:', text);

      if (text && text.trim()) {
        const data = JSON.parse(text) as ApiResponse<typeof mockProfile>;
        expect(data.success).toBe(true);
        expect(data.profile).toEqual(mockProfile);
      }

      // モック関数が正しく呼び出されたか検証
      expect(clerkService.getUserSpotifyToken).toHaveBeenCalledWith('test123', expect.any(Object));
      expect(spotifyService.getUserProfile).toHaveBeenCalledWith(mockToken);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('保存済み曲取得: 正常に曲リストを返す', async () => {
    // モックの戻り値を設定
    const mockToken = 'test-spotify-token';
    const mockTracks = [
      { id: 'track1', name: 'テスト曲1', artist: 'テストアーティスト1', formatted: 'テストアーティスト1 - テスト曲1' },
      { id: 'track2', name: 'テスト曲2', artist: 'テストアーティスト2', formatted: 'テストアーティスト2 - テスト曲2' }
    ];

    vi.mocked(clerkService.getUserSpotifyToken).mockResolvedValue(mockToken);
    vi.mocked(spotifyService.getSavedTracks).mockResolvedValue(mockTracks);

    try {
      const res = await app.request('/api/v1/spotify/saved-tracks?userId=test123&limit=10');

      console.log('Response status:', res.status);

      // レスポンスのステータスコードを確認
      expect(res.status).toBe(200);

      // レスポンス内容をテキストとして取得してからJSONとしてパース
      const text = await res.text();
      console.log('Response text:', text);

      if (text && text.trim()) {
        const data = JSON.parse(text) as ApiResponse<typeof mockTracks>;
        expect(data.success).toBe(true);
        expect(data.tracks).toEqual(mockTracks);
      }

      // モック関数が正しく呼び出されたか検証
      expect(clerkService.getUserSpotifyToken).toHaveBeenCalledWith('test123', expect.any(Object));
      expect(spotifyService.getSavedTracks).toHaveBeenCalledWith(mockToken, 10);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});
