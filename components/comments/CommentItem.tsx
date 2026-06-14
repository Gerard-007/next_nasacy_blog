"use client";

import { useState } from "react";
import CommentForm from "./CommentForm";

export default function CommentItem({ comment, slug, userId, onRefresh }: { comment: any; slug: string; userId?: string; onRefresh?: () => void }) {
  const [showReply, setShowReply] = useState(false);

  async function handleDelete() {
    try {
      await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      onRefresh?.();
    } catch (e) {}
  }

  const authorImage = comment.author?.imageUrl ?? '/placeholder.png';
  const authorName = comment.author?.name ?? 'Unknown User';

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <img
          src={authorImage}
          alt={authorName}
          className="w-10 h-10 rounded-full object-cover border border-outline-variant/10 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-on-surface">{authorName}</span>
            <span className="text-caption text-outline">
              {comment.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(comment.createdAt)) : ""}
            </span>
          </div>
          <div className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
            {comment.content}
          </div>
          
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
              title="Reply"
            >
              <span className="material-symbols-outlined text-[20px]">reply</span>
            </button>
            {userId === comment.authorId && (
              <button
                onClick={handleDelete}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                title="Delete"
              >
                <span className="material-symbols-outlined text-[20px] text-error">delete</span>
              </button>
            )}
          </div>

          {showReply && userId && (
            <div className="mt-3">
              <CommentForm slug={slug} parentId={comment.id} userId={userId} onAdded={() => { setShowReply(false); onRefresh?.(); }} />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-6 space-y-2 pl-4 border-l border-outline-variant/20">
              {comment.replies.map((r: any) => (
                <CommentItem key={r.id} comment={r} slug={slug} userId={userId} onRefresh={onRefresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
