"use client";

import { FormEvent, useState } from "react";

export default function CommentForm({ slug, parentId, userId, onAdded }: { slug: string; parentId?: string | null; userId: string; onAdded?: (c: any) => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, parentId })
      });
      const json = await res.json();
      if (json.ok) {
        setContent("");
        onAdded?.(json.comment);
      }
    } catch (e) {
      // noop
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        rows={3}
        placeholder={parentId ? "Write a reply..." : "Share your thoughts..."}
      />
      <div className="flex justify-end">
        <button
          disabled={loading || !content.trim()}
          className="px-5 py-2 bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
