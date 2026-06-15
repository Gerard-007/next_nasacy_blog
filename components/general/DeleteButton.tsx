"use client";

import { useState } from "react";
import { deletePost } from "@/app/actions";

import { toast } from "@/components/ui/Toast";

interface DeleteButtonProps {
  postId: string;
}

export function DeleteButton({ postId }: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success("Post deleted successfully.");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
      title="Delete"
    >
      <span className="material-symbols-outlined text-[20px]">
        {deleting ? "hourglass_empty" : "delete"}
      </span>
    </button>
  );
}
