"use client";

import { useState } from "react";

import { toast } from "@/components/ui/Toast";

interface PostActionsProps {
  postSlug: string;
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  userId?: string;
}

export default function PostActions({
  postSlug,
  postId,
  initialLikes,
  initialLiked,
  initialBookmarked,
  userId
}: PostActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  async function handleLike() {
    if (!userId) {
      toast.warning("Please log in to like posts.");
      return;
    }
    if (loadingLike) return;
    setLoadingLike(true);

    const method = liked ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/posts/${postSlug}/like`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.ok) {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
        toast.success(liked ? "Post unliked." : "Post liked.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoadingLike(false);
    }
  }

  async function handleBookmark() {
    if (!userId) {
      toast.warning("Please log in to bookmark posts.");
      return;
    }
    if (loadingBookmark) return;
    setLoadingBookmark(true);

    const method = bookmarked ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/posts/${postSlug}/bookmark`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.ok) {
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? "Removed from bookmarks." : "Added to bookmarks.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoadingBookmark(false);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }

  return (
    <>
      {/* Side Interaction (Desktop) */}
      <aside className="hidden lg:flex flex-col gap-6 sticky top-32 h-fit">
        <button
          onClick={handleLike}
          disabled={loadingLike}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-90 cursor-pointer disabled:opacity-50"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            liked
              ? "bg-primary text-on-primary"
              : "bg-surface-container-low text-primary group-hover:bg-primary group-hover:text-on-primary"
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : undefined }}>favorite</span>
          </div>
          <span className="text-caption font-bold text-on-surface-variant">{likes}</span>
        </button>
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-90 cursor-pointer disabled:opacity-50"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            bookmarked
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container-low text-secondary group-hover:bg-secondary group-hover:text-on-secondary"
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {bookmarked ? "bookmark" : "bookmark_border"}
            </span>
          </div>
          <span className="text-caption font-bold text-on-surface-variant">{bookmarked ? "Saved" : "Save"}</span>
        </button>
        <button
          onClick={handleShare}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-90 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-on-surface-variant group-hover:text-surface transition-colors">
            <span className="material-symbols-outlined">share</span>
          </div>
          <span className="text-caption font-bold text-on-surface-variant">Share</span>
        </button>
      </aside>

      {/* Mobile Bottom Interaction Bar */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <div className="glass-card bg-surface/90 border border-outline-variant/20 rounded-full shadow-lg flex justify-around items-center h-14 px-6">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className={`flex items-center gap-1 cursor-pointer disabled:opacity-50 ${liked ? "text-primary font-bold" : "text-primary/70"}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : undefined }}>favorite</span>
            <span className="font-label-md">{likes}</span>
          </button>
          <div className="w-[1px] h-6 bg-outline-variant/30"></div>
          <button
            onClick={handleBookmark}
            disabled={loadingBookmark}
            className={`flex items-center gap-1 cursor-pointer disabled:opacity-50 ${bookmarked ? "text-secondary font-bold" : "text-secondary/70"}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {bookmarked ? "bookmark" : "bookmark_border"}
            </span>
            <span className="font-label-md">{bookmarked ? "Saved" : "Save"}</span>
          </button>
          <div className="w-[1px] h-6 bg-outline-variant/30"></div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-on-surface-variant/80 hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined">share</span>
            <span className="font-label-md">Share</span>
          </button>
        </div>
      </div>
    </>
  );
}
