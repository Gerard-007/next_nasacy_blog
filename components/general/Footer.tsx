"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 px-gutter max-w-container-max mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface block mb-4">Nasacy</span>
          <p className="text-on-surface-variant font-caption text-caption">
            Elevating industry discourse through precision-crafted content and deep insights.
          </p>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest font-bold">Platform</h4>
          <ul className="space-y-4">
            <li>
              <Link className="text-on-surface-variant hover:text-primary transition-opacity font-caption text-caption" href="/about">
                About
              </Link>
            </li>
            <li>
              <a className="text-on-surface-variant hover:text-primary transition-opacity font-caption text-caption" href="#">
                Careers
              </a>
            </li>
            <li>
              <Link className="text-on-surface-variant hover:text-primary transition-opacity font-caption text-caption" href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest font-bold">Legal</h4>
          <ul className="space-y-4">
            <li>
              <a className="text-on-surface-variant hover:text-primary transition-opacity font-caption text-caption" href="#">
                Privacy
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant hover:text-primary transition-opacity font-caption text-caption" href="#">
                Terms
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest font-bold">Connect</h4>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/10 py-8 px-gutter max-w-container-max mx-auto flex justify-between items-center">
        <p className="text-on-surface-variant font-caption text-caption">© 2026 Nasacy Ltd. All rights reserved.</p>
        <div className="flex gap-6">
          <button
            onClick={toggleTheme}
            className="text-outline hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {mounted && theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
