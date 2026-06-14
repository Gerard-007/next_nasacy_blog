"use client";

import { useState } from "react";

interface FollowAuthorButtonProps {
  authorId: string;
  initialFollowing: boolean;
  userId?: string;
}

export default function FollowAuthorButton({
  authorId,
  initialFollowing,
  userId
}: FollowAuthorButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    if (!userId) {
      alert("Please log in to follow authors.");
      return;
    }
    if (userId === authorId) return;
    if (loading) return;
    setLoading(true);

    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/users/${authorId}/follow`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.ok) {
        setFollowing(!following);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Don't render follow button if viewing own profile
  if (userId === authorId) return null;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`font-label-md px-5 py-2 rounded-full transition-all border cursor-pointer ${
        following
          ? "bg-surface-container-high text-on-surface border-outline-variant hover:bg-surface-container-highest"
          : "bg-primary text-on-primary border-primary hover:bg-primary/90 shadow-sm"
      } disabled:opacity-50`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
