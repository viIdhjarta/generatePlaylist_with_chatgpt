"use client";

import { useState } from "react";
import { API_URL } from "./config";
import "./globals.css";
import { useUser } from "@clerk/nextjs";
import { getUseFavoritesState } from "./components/FavoritesToggle";
import FavoritesToggle from "./components/FavoritesToggle";
// プレイリスト結果の型定義
interface Playlist {
  prompt: string;
  setlist_id: string;
  playlist?: {
    id: string;
    url: string;
    external_url: string;
    name: string;
  }
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  const { user } = useUser();

  // サンプルプロンプト
  const samplePrompts = [
    "集中して作業したい時に聴きたい曲",
    "90年代の懐かしいJ-POPを集めたプレイリスト",
    "ドライブに最適なアップテンポな曲",
    "リラックスしてお風呂に入りたい時の曲",
    "朝の目覚めに聴きたい爽やかな曲"
  ];

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;
    const clerkUserId = user?.id || "";
    setLoading(true);
    setError(null);

    try {
      const useFavorites = getUseFavoritesState();

      const response = await fetch(`${API_URL}/playlist/generate?userId=${clerkUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, useFavorites}),
      });

      const setlist = await response.json();

      const setlist_id = setlist.playlist.id

      if (!response.ok) {
        throw new Error(setlist_id.error || 'プレイリストの生成に失敗しました');
      }

      setPlaylist({
        prompt,
        setlist_id: setlist_id
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // プロンプトのサンプルをクリックした時の処理
  const handleSampleClick = (sample: string) => {
    setPrompt(sample);
  };

  // 新しいプレイリストを作成（結果画面からリセット）
  const handleReset = () => {
    setPlaylist(null);
    setPrompt("");
  };

  const openSpotify = () => {
    if (playlist?.setlist_id) {
      window.open(`https://open.spotify.com/playlist/${playlist.setlist_id}`, '_blank');
    }
    console.log(playlist?.setlist_id)
  };

  // プレイリスト入力フォーム
  const renderForm = () => (
    <>
      <div className="text-white text-4xl md:text-5xl font-bold text-center leading-tight mb-6">
        自然言語で<span className="text-green-500">Spotify</span>プレイリストを作成
      </div>
      <p className="text-gray-400 text-center mb-10 max-w-xl">
        あなたの気分や状況を言葉で表現するだけで、ぴったりのプレイリストを自動生成
      </p>

      <div className="bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-xl border border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <FavoritesToggle />
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-800 rounded-full px-5 py-4 text-gray-200 pr-12 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              placeholder="例: 雨の日に聴きたい落ち着く曲"
              disabled={loading}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-icon lucide-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
          </div>
          <button
            type="submit"
            className={`w-full bg-green-500 text-black font-bold py-4 rounded-full transition flex items-center justify-center gap-2 ${loading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles-icon lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
            )}
            {loading ? "生成中..." : "プレイリストを作成"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
            エラー: {error}
          </div>
        )}
      </div>

      <div className="w-full max-w-xl mx-auto px-4 mb-12">
        <div className="text-center text-gray-300 font-bold text-lg mb-6 mt-10">こんな風に聞いてみましょう</div>
        <div className="flex flex-col gap-3">
          {samplePrompts.map((samplePrompt, index) => (
            <button
              key={index}
              onClick={() => handleSampleClick(samplePrompt)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 text-left hover:bg-gray-800 transition group"
            >
              <span className="text-gray-300 group-hover:text-spotify-green">{samplePrompt}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  // プレイリスト結果表示
  const renderPlaylist = () => (
    <>
      <div className="w-full max-w-xl mx-auto my-6">

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 w-full border border-gray-800 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-300 italic">{playlist?.prompt}</p>
          </div>

          {playlist?.setlist_id && (
            <div className="mb-6">
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlist.setlist_id}`}
                width="100%"
                height="380"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          )}

        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleReset}
            className="w-full bg-gray-800 text-white font-bold py-4 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
          >
            新しいプレイリストを作成
          </button>
          {playlist?.setlist_id && (
            <button
              onClick={openSpotify}
              className="w-full bg-green-500 text-black font-bold py-4 rounded-full hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-spotify"><circle cx="12" cy="12" r="10" /><path d="M8 11.8A5.4 5.4 0 0 1 17.8 9" /><path d="M7 15a6.5 6.5 0 0 1 11.4-4.3" /><path d="M8.5 18a8 8 0 0 1 13.5-5.3" /></svg>
              Spotifyで開く
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between">
      <div className="flex flex-col items-center mt-12 w-full px-4">
        <div className="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music-icon lucide-music"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
          <h1 className="text-white text-3xl font-bold">Spotify AI</h1>
        </div>

        {/* プレイリストの有無で表示を切り替え */}
        {playlist ? renderPlaylist() : renderForm()}
      </div>

      <footer className="w-full text-center py-8 bg-gray-900 text-gray-400 text-sm border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-white">Spotify AI Playlist Creator</span>
        </div>
        <div>
          by{" "}
          <a href="https://github.com/viIdhjarta" className="text-green-400 hover:underline">
            vildhjarta
          </a>
        </div>
      </footer>
    </div>
  );
}