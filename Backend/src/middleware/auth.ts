// 認証ミドルウェア
import { Context, Next } from 'hono';
import { env } from 'hono/adapter';

/**
 * API Keyが必要なエンドポイント用ミドルウェア
 */
export async function apiKeyAuth(c: Context, next: Next) {
  const apiKey = c.req.header('x-api-key');
  const { API_KEY } = env<{ API_KEY: string }>(c);
  
  if (!apiKey || apiKey !== API_KEY) {
    return c.json({ error: '認証エラー' }, 401);
  }
  
  await next();
}

/**
 * ユーザーIDを検証するミドルウェア
 */
export async function validateUserId(c: Context, next: Next) {
  const userId = c.req.query('userId') || c.req.header('x-user-id');
  
  if (!userId) {
    return c.json({ error: 'ユーザーIDが必要です' }, 400);
  }
  
  c.set('userId', userId);
  await next();
}