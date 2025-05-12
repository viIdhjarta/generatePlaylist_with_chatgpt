# Spotify AIプレイリストジェネレーター 

https://generate-playlist-with-chatgpt.vercel.app

## デモ
https://github.com/user-attachments/assets/062d6625-8520-447e-bf7d-a75135bce790<br>
(お気に入り曲利用の有無で作成されるプレイリストが違うことが確認できます)
## 🎯 製作動機

自分がSpotifyに保存したお気に入り曲をAIに投げると，おすすめのアーティストを良い精度でレコメンドしてくれることに気付いたため，自動でお気に入り曲取得からプレイリスト作成まで行うツールを作りました．お気に入り曲からだけでなく気分なども反映できると面白いと思い機能を実装しました．
また，Oauthによる認証/認可の流れの学習や，認証サービスClerkやOpenAI APIの使用方法について学習することも目的としています．

## 💻 技術構成

### フロントエンド
- **フレームワーク**: Next.js 
- **認証**: Clerk（OAuthによるSpotify認証）
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **デプロイ**: Vercel

### バックエンド
- **フレームワーク**: Hono
- **ランタイム**: Cloudflare Workers
- **API連携**:
  - OpenAI API 
  - Spotify Web API
  - Clerk API

### 主要な機能
1. **自然言語によるプレイリスト生成**: ユーザーの入力から最適な曲を選定
2. **Spotifyアカウント連携**: OAuthによるシームレスな接続
3. **お気に入り曲の活用**: ユーザーの好みを反映したパーソナライズ推薦
4. **プレイリスト作成**: 生成結果をSpotifyプレイリストとして保存

## 📂 ディレクトリ構成

### プロジェクト全体
```
/
├── frontend/        # Next.jsフロントエンド
├── Backend/         # Honoバックエンド
├── package.json     # ルートパッケージ設定
└── README.md        # プロジェクト概要
```

### フロントエンド構成
```
frontend/
├── src/
│   ├── app/                # Next.js Appルーター
│   │   ├── page.tsx        # トップページ
│   │   ├── config.ts       # APIエンドポイント設定
│   │   ├── layout.tsx      # 共通レイアウト
│   │   └── sign-in/        # サインインページ
│   ├── components/         # 再利用可能コンポーネント
│   │   └── FavoritesToggle.tsx # お気に入り曲利用切替UI
│   └── middleware.ts       # Clerk認証ミドルウェア
└── package.json            # 依存関係
```

### バックエンド構成
```
Backend/
├── src/
│   ├── index.ts            # メインエントリーポイント
│   ├── routes/             # APIルート定義
│   │   ├── auth.ts         # 認証関連エンドポイント
│   │   ├── playlist.ts     # プレイリスト生成エンドポイント
│   │   └── spotify.ts      # Spotify関連エンドポイント
│   ├── services/           # ビジネスロジック
│   │   ├── clerk.ts        # Clerk APIサービス
│   │   ├── openai.ts       # OpenAI APIサービス
│   │   └── spotify.ts      # Spotify APIサービス
│   ├── middleware/         # ミドルウェア
│   │   └── error-handler.ts # エラーハンドリング
│   ├── types/              # 型定義
│   │   └── index.ts        # 共通型
│   └── util/               # ユーティリティ関数
└── wrangler.jsonc          # Cloudflare Workers設定
```

## 🔄 主要な処理フロー

1. **ユーザー認証フロー**:
   - Clerkを使用したOAuth認証によりSpotifyアカウントと連携
   - バックエンドでSpotifyトークンを取得し安全に管理

2. **プレイリスト生成フロー**:
   - フロントエンドでユーザー入力を受け取る
   - バックエンドでOpenAI APIを使用して曲リストを生成
   - Spotify APIで曲を検索し、プレイリストを作成
   - 結果をフロントエンドに返却して表示

3. **お気に入り曲活用フロー**:
   - 自身のライブラリ上のお気に入り曲を利用するか選択
   - バックエンドでSpotify APIからお気に入り曲を取得
   - AIプロンプトにお気に入り曲の情報を追加して推薦精度を向上

## 🚀 技術的特長

1. **サーバーレスアーキテクチャ**:
   - Cloudflare WorkersとVercelによる完全サーバーレス構成
   - 高速なレスポンスと優れたスケーラビリティを実現

2. **モダンなWeb技術**:
   - Next.js App Routerによる最新のフロントエンド構成
   - Honoを使用した軽量で高速なバックエンドAPI

3. **AIと音楽の融合**:
   - 自然言語処理による音楽推薦の新しいアプローチ
   - ユーザーの好みとAI生成の組み合わせによる独自性

4. **セキュアな認証連携**:
   - Clerkを使用した安全なOAuth認証の実装
   - トークン管理の分離によるセキュリティ向上
