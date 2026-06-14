"use client"

import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import ModeToggle from "./ModeToggle";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";

export function Navbar() {
    const { getUser } = useKindeBrowserClient();
    const user = getUser();
    const synced = useRef(false);
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (!user || synced.current) return;
        (async () => {
            try {
                const payload = {
                    sub: (user as any).id ?? (user as any).sub,
                    email: user.email,
                    name: user.given_name ? `${user.given_name} ${user.family_name ?? ''}`.trim() : undefined,
                    given_name: user.given_name,
                    picture: user.picture,
                };
                const res = await fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (json?.ok && json.user?.id) {
                    try { localStorage.setItem('nasacy_user_id', json.user.id); } catch (e) {}
                }
            } catch (e) {}
        })();
        synced.current = true;
    }, [user]);

    const navLinks = [
        { href: "/", label: "Discover", active: pathname === "/" },
        { href: "/categories", label: "Writers" },
        { href: "/categories", label: "Topics" },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 glass-nav border-b border-outline-variant/30 shadow-sm">
                <div className="relative flex items-center justify-between h-16 px-gutter max-w-container-max mx-auto">
                    {/* Left: Logo */}
                    <Link href="/" className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed tracking-tight active:scale-95 transition-transform">
                        Nasacy
                    </Link>

                    {/* Center: Nav Links */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <Link
                            href="/"
                            className={`text-body-md font-body-md transition-colors duration-200 py-1 ${pathname === "/" ? "text-primary dark:text-primary-fixed font-bold border-b-2 border-primary" : "text-on-surface-variant dark:text-outline hover:text-primary"}`}
                        >
                            Discover
                        </Link>
                        <Link
                            href="/about"
                            className={`text-body-md font-body-md transition-colors duration-200 py-1 ${pathname.startsWith("/category") ? "text-primary dark:text-primary-fixed font-bold border-b-2 border-primary" : "text-on-surface-variant dark:text-outline hover:text-primary"}`}
                        >
                            About
                        </Link>
                        <Link
                            href="/categories"
                            className={`text-body-md font-body-md transition-colors duration-200 py-1 ${pathname.startsWith("/category") ? "text-primary dark:text-primary-fixed font-bold border-b-2 border-primary" : "text-on-surface-variant dark:text-outline hover:text-primary"}`}
                        >
                            Topics
                        </Link>
                        <Link
                            href="/contact"
                            className={`text-body-md font-body-md transition-colors duration-200 py-1 ${pathname.startsWith("/category") ? "text-primary dark:text-primary-fixed font-bold border-b-2 border-primary" : "text-on-surface-variant dark:text-outline hover:text-primary"}`}
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Right: Actions */}

                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors" onClick={() => setSearchOpen(!searchOpen)}>
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        {user ? (
                            <>
                                {/* <Link
                                    href="/dashboard/create"
                                    className="hidden md:inline-flex bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all animate-none"
                                >
                                    Write
                                </Link> */}
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-surface-container transition-colors active:scale-95 outline-none cursor-pointer">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center border border-outline-variant/30">
                                            {user.picture ? (
                                                <img src={user.picture} alt="User profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-label-md font-bold text-primary">{user.given_name?.charAt(0) || "U"}</span>
                                            )}
                                        </div>
                                        <span className="font-label-md text-label-md text-on-surface hidden md:inline">{user.given_name || "User"}</span>
                                    </DropdownMenu.Trigger>

                                    <DropdownMenu.Portal>
                                        <DropdownMenu.Content
                                            align="end"
                                            sideOffset={8}
                                            className="z-50 min-w-[200px] bg-surface dark:bg-surface-dim border border-outline-variant/20 dark:border-outline-variant/10 rounded-2xl p-2 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
                                        >
                                            <DropdownMenu.Item asChild>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer outline-none text-body-md font-body-md text-on-surface-variant hover:text-on-surface"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                                    <span>Dashboard</span>
                                                </Link>
                                            </DropdownMenu.Item>

                                            <DropdownMenu.Item asChild>
                                                <Link
                                                    href="/dashboard/create"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer outline-none text-body-md font-body-md text-on-surface-variant hover:text-on-surface"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                    <span>Write</span>
                                                </Link>
                                            </DropdownMenu.Item>

                                            <DropdownMenu.Item
                                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer outline-none text-body-md font-body-md text-on-surface-variant hover:text-on-surface"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {theme === "dark" ? "light_mode" : "dark_mode"}
                                                </span>
                                                <span>Change Theme</span>
                                            </DropdownMenu.Item>

                                            <div className="h-px bg-outline-variant/20 dark:bg-outline-variant/10 my-1" />

                                            <DropdownMenu.Item asChild>
                                                <LogoutLink
                                                    postLogoutRedirectURL="/"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-error-container/20 text-error transition-all cursor-pointer outline-none text-body-md font-body-md"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                                    <span>Sign Out</span>
                                                </LogoutLink>
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Root>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <ModeToggle />
                                <LoginLink className="hidden sm:block text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors duration-200">
                                    Sign In
                                </LoginLink>
                                <RegisterLink className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all">
                                    Get Started
                                </RegisterLink>
                            </div>
                        )}
                    </div>
                </div>
                {searchOpen && (
                    <div className="border-t border-outline-variant/20 px-gutter py-3 bg-surface/95 backdrop-blur-xl">
                        <div className="max-w-container-max mx-auto relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                            <form action="/search" method="get">
                                <input
                                    name="q"
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Search insights..."
                                    type="text"
                                />
                            </form>
                        </div>
                    </div>
                )}
            </nav>

            <div className="h-16" />

            <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface dark:bg-surface-dim border-t border-outline-variant/30 shadow-lg">
                <div className="flex justify-around items-center py-3 pb-safe px-4">
                    <Link href="/" className={`flex flex-col items-center gap-1 active:bg-surface-container-high tap-highlight-transparent ${pathname === "/" ? "text-primary dark:text-primary-fixed" : "text-on-surface-variant dark:text-outline"}`}>
                        <span className="material-symbols-outlined" style={pathname === "/" ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
                        <span className="font-label-md text-label-md">Home</span>
                    </Link>
                    <Link href="/search" className={`flex flex-col items-center gap-1 active:bg-surface-container-high tap-highlight-transparent ${pathname === "/search" ? "text-primary dark:text-primary-fixed" : "text-on-surface-variant dark:text-outline"}`}>
                        <span className="material-symbols-outlined">search</span>
                        <span className="font-label-md text-label-md">Search</span>
                    </Link>
                    <Link href="/bookmarks" className={`flex flex-col items-center gap-1 active:bg-surface-container-high tap-highlight-transparent ${pathname === "/bookmarks" ? "text-primary dark:text-primary-fixed" : "text-on-surface-variant dark:text-outline"}`}>
                        <span className="material-symbols-outlined">bookmarks</span>
                        <span className="font-label-md text-label-md">Library</span>
                    </Link>
                    <Link href={user ? "/dashboard" : "/"} className={`flex flex-col items-center gap-1 active:bg-surface-container-high tap-highlight-transparent ${pathname === "/dashboard" ? "text-primary dark:text-primary-fixed" : "text-on-surface-variant dark:text-outline"}`}>
                        <span className="material-symbols-outlined">{user ? "person" : "login"}</span>
                        <span className="font-label-md text-label-md">{user ? "Profile" : "Sign In"}</span>
                    </Link>
                </div>
            </nav>
        </>
    );
}
