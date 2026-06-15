"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { usePathname } from "next/navigation";

interface DashboardMobileNavProps {
  userId: string;
  isAdmin: boolean;
}

export function DashboardMobileNav({ userId, isAdmin }: DashboardMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname === "/bookmarks" || isAdminRoute;
  if (!isDashboardRoute) return null;

  useEffect(() => {
    if (isAdminRoute) {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get("tab") || "overview");
    }
  }, [isAdminRoute]);

  const dashboardLinks = [
    { href: "/dashboard", label: "Overview", icon: "dashboard", active: pathname === "/dashboard" },
    { href: "/dashboard/posts", label: "Post Management", icon: "edit_note", active: pathname === "/dashboard/posts" },
    { href: "/bookmarks", label: "Bookmarks", icon: "bookmarks", active: pathname === "/bookmarks" },
    { href: `/profile/${userId}`, label: "Profile", icon: "person", active: pathname.startsWith("/profile") },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: "dashboard", active: currentTab === "overview" },
    { href: "/admin?tab=users", label: "User Management", icon: "group", active: currentTab === "users" },
    { href: "/admin?tab=posts", label: "Post Moderation", icon: "edit_note", active: currentTab === "posts" },
    { href: "/admin?tab=reports", label: "Reports", icon: "report", active: currentTab === "reports" },
  ];

  const links = isAdminRoute ? adminLinks : dashboardLinks;

  return (
    <div className="md:hidden fixed top-20 left-4 z-40">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Dashboard Menu"
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? "close" : "menu_open"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Card */}
          <div className="absolute top-14 left-0 w-64 bg-surface dark:bg-surface-dim border border-outline-variant/30 rounded-2xl shadow-xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
            <p className="font-label-md text-label-md text-outline uppercase tracking-widest px-3 mb-2">{isAdminRoute ? "Admin" : "Dashboard"}</p>
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    link.active
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  <span className="text-body-md">{link.label}</span>
                </Link>
              ))}

              {isAdmin && !isAdminRoute && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span className="text-body-md">Admin Panel</span>
                </Link>
              )}

              {isAdminRoute && (
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span className="text-body-md">Back to Blog</span>
                </Link>
              )}

              <div className="h-px bg-outline-variant/20 my-2" />

              <LogoutLink
                postLogoutRedirectURL="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error-container/20 transition-all cursor-pointer text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Sign Out</span>
              </LogoutLink>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
