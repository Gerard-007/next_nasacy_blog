"use client";

import { useState } from "react";
import BlogPostCard from "./BlogPostCard";

interface HomePostTabsProps {
  latestPosts: any[];
  topPosts: any[];
}

export default function HomePostTabs({ latestPosts, topPosts }: HomePostTabsProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "top">("latest");

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-outline-variant/30 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("latest")}
          className={`pb-4 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "latest"
              ? "text-primary border-b-2 border-primary font-bold"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => setActiveTab("top")}
          className={`pb-4 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "top"
              ? "text-primary border-b-2 border-primary font-bold"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Top Posts
        </button>
      </div>

      {/* Grid of Post Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeTab === "latest" ? (
          latestPosts.length === 0 ? (
            <div className="col-span-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center text-on-surface-variant">
              No posts published yet. Check back soon!
            </div>
          ) : (
            latestPosts.map((post) => (
              <BlogPostCard key={post.id} data={post} />
            ))
          )
        ) : (
          topPosts.length === 0 ? (
            <div className="col-span-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center text-on-surface-variant">
              No top posts found.
            </div>
          ) : (
            topPosts.map((post) => (
              <BlogPostCard key={post.id} data={post} />
            ))
          )
        )}
      </div>
    </div>
  );
}
