'use client'

import { SignedIn } from "@clerk/nextjs"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"

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
    <SignedIn>
      <div className="flex justify-end items-center gap-2 mb-4">
        <Switch checked={useFavorites} onCheckedChange={setUseFavorites} />
        <span className="text-gray-300 text-sm">いいねした曲を読み込む</span>
      </div>
    </SignedIn>
  )
}