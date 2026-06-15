"use client";

import React, { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastCallback = (message: string, type: ToastType) => void;
let toastListeners: ToastCallback[] = [];

export const showToast = (message: string, type: ToastType = "info") => {
  toastListeners.forEach((listener) => listener(message, type));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bgClass = "bg-surface-container-high text-on-surface border border-outline-variant/30";
        let icon = "info";
        
        if (t.type === "success") {
          bgClass = "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40";
          icon = "check_circle";
        } else if (t.type === "error") {
          bgClass = "bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40";
          icon = "error";
        } else if (t.type === "warning") {
          bgClass = "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40";
          icon = "warning";
        }

        return (
          <div
            key={t.id}
            className={`p-4 rounded-2xl shadow-lg text-body-md font-medium flex items-center gap-3 pointer-events-auto transition-all transform translate-y-0 scale-100 animate-in fade-in-0 slide-in-from-top-4 duration-200 ${bgClass}`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">{icon}</span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high/20 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const toast = {
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  info: (msg: string) => showToast(msg, "info"),
  warning: (msg: string) => showToast(msg, "warning"),
};
