// メインエントリーポイント
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error-handler';

// ルート
import spotifyRoutes from './routes/spotify';
import playlistRoutes from './routes/playlist';
import authRoutes from './routes/auth';

const app = new Hono();

// グローバルミドルウェア
app.use('*', cors());
app.use('*', logger());
app.use('*', errorHandler);

// APIドキュメント
app.get('/', (c) => {
  return c.json({
    name: 'AI Playlist Generator API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/v1/auth/spotify-token', method: 'GET', description: 'Get Spotify token' },
      { path: '/api/v1/spotify/profile', method: 'GET', description: 'Get user profile' },
      { path: '/api/v1/spotify/saved-tracks', method: 'GET', description: 'Get user saved tracks' },
      { path: '/api/v1/playlist/generate', method: 'POST', description: 'Generate playlist' },
    ]
            });
        });

// APIエンドポイント
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/spotify', spotifyRoutes);
app.route('/api/v1/playlist', playlistRoutes);

export default app;