"use client";

import { useEffect, useState } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { API_URL } from "../config";
const SpotifyProfile = () => {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      try {
        // クライアントサイドでセッショントークンを取得
        const sessionToken = await session?.getToken();
        console.log(sessionToken);

        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            "Authorization": `Bearer ${sessionToken}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok) {
          setProfile(data.user);
        } else {
          setError(data.error || "Failed to fetch Spotify profile");
        }
      } catch (err) {
        setError("An error occurred while fetching Spotify profile");
      }
    };

    fetchSpotifyProfile();
  }, [isSignedIn, session]);

  return (
    <div>
      <h2>Spotify Profile</h2>
      <p>Spotify ID: {profile?.id}</p>
      <p>Username: {profile?.display_name}</p>
      {profile?.imageUrl && (
        <img
          src={profile?.imageUrl}
          alt="Spotify profile"
          width={50}
          height={50}
        />
      )}
    </div>
  );
}

export default SpotifyProfile;