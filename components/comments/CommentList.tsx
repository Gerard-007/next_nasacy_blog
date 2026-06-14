"use client";

import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

export default function CommentList({ slug, userId: propUserId }: { slug: string; userId?: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(propUserId);

  useEffect(() => {
    if (!propUserId) {
      try {
        const id = localStorage.getItem('nasacy_user_id');
        if (id) setUserId(id);
      } catch (e) {}
    }
  }, [propUserId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      const json = await res.json();
      if (json.ok) setComments(json.comments);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [slug]);

  return (
    <div className="space-y-6">
      {userId ? (
        <CommentForm slug={slug} userId={userId} onAdded={load} />
      ) : (
        <p className="text-body-md text-on-surface-variant">Log in to join the discussion.</p>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-on-surface-variant py-6">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <span className="text-body-md">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-body-md text-outline py-6">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="divide-y divide-outline-variant/10">
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} slug={slug} userId={userId} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}
