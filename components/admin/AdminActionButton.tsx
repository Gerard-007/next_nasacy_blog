"use client";

import { useTransition } from "react";

interface AdminActionButtonProps {
  action: () => Promise<void>;
  confirmMessage?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function AdminActionButton({
  action,
  confirmMessage,
  className = "",
  disabled = false,
  children,
}: AdminActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    if (confirmMessage) {
      const ok = window.confirm(confirmMessage);
      if (!ok) {
        e.preventDefault();
        return;
      }
    }

    startTransition(async () => {
      try {
        await action();
      } catch (err: any) {
        alert(err?.message || "Action failed. Please try again.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all`}
    >
      {isPending ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
