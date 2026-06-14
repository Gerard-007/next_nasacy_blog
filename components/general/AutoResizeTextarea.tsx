"use client"

import { useRef } from "react";

interface AutoResizeTextareaProps {
  name: string;
  placeholder: string;
  required?: boolean;
}

export default function AutoResizeTextarea({ name, placeholder, required }: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "";
    el.style.height = el.scrollHeight + "px";
  }

  return (
    <textarea
      ref={ref}
      name={name}
      className="w-full bg-transparent border-none p-0 text-display-lg font-display-lg placeholder:text-outline-variant resize-none focus:ring-0 overflow-hidden"
      onInput={handleInput}
      placeholder={placeholder}
      rows={1}
      required={required}
    />
  );
}
