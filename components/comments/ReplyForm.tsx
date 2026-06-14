"use client";

import CommentForm from "./CommentForm";

export default function ReplyForm({ slug, parentId, userId, onAdded }: { slug: string; parentId: string; userId: string; onAdded?: (c: any) => void }) {
  return <CommentForm slug={slug} parentId={parentId} userId={userId} onAdded={onAdded} />;
}
