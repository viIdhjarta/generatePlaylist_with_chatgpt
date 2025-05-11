"use client";

import { useEffect, useState } from "react";

type FavoritesContextType = {
  useFavorites: boolean;
  setUseFavorites: (value: boolean) => void;
};

// グローバル状態
let globalFavoritesState: FavoritesContextType = {
  useFavorites: false,
  setUseFavorites: () => {},
};

// 外部からアクセスするためのヘルパー関数
export function getUseFavoritesState(): boolean {
  return globalFavoritesState.useFavorites;
}

export default function FavoritesToggle() {
  const [useFavorites, setUseFavorites] = useState(false);

  // グローバル状態を更新
  useEffect(() => {
    globalFavoritesState = {
      useFavorites,
      setUseFavorites,
    };
  }, [useFavorites]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-300 text-sm">お気に入り曲を利用</span>
      <label className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          value="" 
          className="sr-only peer"
          checked={useFavorites}
          onChange={() => setUseFavorites(!useFavorites)}
        />
        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );
}