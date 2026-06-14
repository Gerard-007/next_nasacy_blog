"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export default function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Toggle theme"
        >
            <span className="material-symbols-outlined hidden dark:block">light_mode</span>
            <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
        </button>
    )
}
