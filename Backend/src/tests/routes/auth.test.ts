// Backend/src/tests/routes/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../../index';
import * as clerkService from '../../services/clerk';
import { env } from 'hono/adapter';

// レスポンスの型定義
type ApiResponse<T = any> = {
  success: boolean;
  token?: string;
  error?: string;
};

// モックの設定
vi.mock('../../services/clerk', () => ({
  getUserSpotifyToken: vi.fn()
}));

// Honoのenv関数をモック
vi.mock('hono/adapter', () => ({
  env: vi.fn().mockImplementation(() => ({
    CLERK_API_KEY: 'test-clerk-api-key'
  }))
}));

describe('認証ルーターのテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(env).mockImplementation(() => ({
      CLERK_API_KEY: 'test-clerk-api-key'
    }));
  });

  it('Spotifyトークン取得: ユーザーIDがない場合は400エラーを返す', async () => {
    try {
      const res = await app.request('/api/v1/auth/spotify-token');
      
      expect(res.status).toBe(400);
      const text = await res.text();
      if (text && text.trim()) {
        const data = JSON.parse(text) as ApiResponse;
        expect(data.success).toBe(false);
        expect(data.error).toContain('ユーザーID');
      }
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('Spotifyトークン取得: 正常にトークンを返す', async () => {
    try {
      // モックの戻り値を設定
      vi.mocked(clerkService.getUserSpotifyToken).mockResolvedValue('test-token');
      
      const res = await app.request('/api/v1/auth/spotify-token?userId=test123');
      
      expect(res.status).toBe(200);
      const text = await res.text();
      if (text && text.trim()) {
        const data = JSON.parse(text) as ApiResponse;
        expect(data.success).toBe(true);
        expect(data.token).toBe('test-token');
      }
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('Spotifyトークン取得: エラー発生時は500エラーを返す', async () => {
    try {
      // モックでエラーを発生させる
      vi.mocked(clerkService.getUserSpotifyToken).mockRejectedValue(new Error('テストエラー'));
      
      const res = await app.request('/api/v1/auth/spotify-token?userId=test123');
      
      expect(res.status).toBe(500);
      const text = await res.text();
      if (text && text.trim()) {
        const data = JSON.parse(text) as ApiResponse;
        expect(data.success).toBe(false);
        expect(data.error).toContain('テストエラー');
      }
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});