// エラーハンドリングミドルウェア
import { Context, Next } from 'hono';

/**
 * グローバルエラーハンドラー
 */
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      return c.json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 500);
    }
    
    return c.json({ error: '内部サーバーエラー' }, 500);
  }
}