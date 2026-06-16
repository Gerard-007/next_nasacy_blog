"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateUserProfileAction } from "@/app/actions";

interface ProfileTabsProps {
  posts: any[];
  aboutMe: string | null;
  gender: string | null;
  name: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  isOwner: boolean;
  userId: string;
}

export default function ProfileTabs({
  posts,
  aboutMe,
  gender,
  name,
  imageUrl,
  bannerUrl,
  isOwner,
  userId,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "update">("posts");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Form states for profile fields
  const [profileName, setProfileName] = useState(name ?? "");
  const [profileImg, setProfileImg] = useState(imageUrl ?? "");
  const [profileBanner, setProfileBanner] = useState(bannerUrl ?? "");
  const [profileGender, setProfileGender] = useState(gender ?? "");
  const [profileBio, setProfileBio] = useState(aboutMe ?? "");

  async function uploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    return data.url;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") {
    const file = e.target.files?.[0];
    if (!file) return;
    const setter = type === "avatar" ? setUploadingImg : setUploadingBanner;
    setter(true);
    setError(null);
    try {
      const url = await uploadFile(file, "insighthub/profiles");
      if (type === "avatar") setProfileImg(url);
      else setProfileBanner(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setter(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", profileName);
    formData.append("imageUrl", profileImg);
    formData.append("bannerUrl", profileBanner);
    formData.append("gender", profileGender);
    formData.append("aboutMe", profileBio);

    startTransition(async () => {
      try {
        await updateUserProfileAction(userId, formData);
        setSuccess(true);
        // Automatically switch back to About tab to see updates
        setTimeout(() => {
          setActiveTab("about");
          setSuccess(false);
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Failed to update profile.");
      }
    });
  }

  function getReadTime(content: string | null) {
    return Math.max(1, Math.ceil(String(content ?? "").replace(/<[^>]*>/g, "").length / 1000));
  }

  function formatCount(num: number) {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toLocaleString();
  }

  return (
    <div className="lg:col-span-8">
      {/* Tabs list */}
      <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-4 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "posts"
              ? "border-b-2 border-primary text-primary font-bold"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Authored Posts
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`px-6 py-4 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "about"
              ? "border-b-2 border-primary text-primary font-bold"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          About
        </button>
        {isOwner && (
          <button
            onClick={() => setActiveTab("update")}
            className={`px-6 py-4 font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "update"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Update Profile
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "posts" && (
          <div className="space-y-8 animate-fade-in">
            {posts.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[64px] text-primary/30 mb-4">article</span>
                <p className="text-on-surface-variant text-body-lg font-body-lg">No posts published yet.</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="group bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow block"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {(post.imageUrl || post.categories?.[0]?.category?.imageUrl) ? (
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 relative">
                        <Image
                          src={post.imageUrl || post.categories?.[0]?.category?.imageUrl || ""}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="hidden md:block w-48 h-32 rounded-lg shrink-0 bg-surface-container-highest" />
                    )}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {post.categories?.[0] && (
                            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-md text-[12px] uppercase tracking-wider">
                              {post.categories[0].category.name}
                            </span>
                          )}
                          <span className="text-caption font-caption text-on-surface-variant">
                            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                              new Date(post.createdAt)
                            )}{" "}
                            · {getReadTime(post.content)} min read
                          </span>
                        </div>
                        <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors mb-2">
                          {post.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          <span className="text-caption font-caption">{formatCount(post._count?.likes ?? 0)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                          <span className="text-caption font-caption">{formatCount(post._count?.comments ?? 0)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-3">About Author</h3>
              <p className="text-on-surface font-body-lg text-body-lg leading-relaxed whitespace-pre-line">
                {profileBio || "This author hasn't shared any information yet."}
              </p>
            </div>

            {profileGender && (
              <div className="pt-6 border-t border-outline-variant/20">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-2">Gender</h4>
                <p className="text-on-surface font-body-md text-body-md">{profileGender}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "update" && isOwner && (
          <form
            onSubmit={handleUpdateProfile}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-sm space-y-6 animate-fade-in"
          >
            <h3 className="text-headline-sm font-headline-sm text-on-surface border-b border-outline-variant/20 pb-4 mb-6">
              Update Profile Information
            </h3>

            {error && (
              <div className="p-4 bg-error-container/20 text-error rounded-xl font-label-md text-label-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-success-container/20 text-success rounded-xl font-label-md text-label-md">
                Profile updated successfully! Switching to About...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors text-body-md"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Gender</label>
                <select
                  value={profileGender}
                  onChange={(e) => setProfileGender(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors text-body-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "avatar")}
                  className="w-full text-body-md text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-on-primary file:font-label-md file:text-label-md file:cursor-pointer hover:file:bg-primary/90"
                />
                {uploadingImg && <p className="text-caption text-outline mt-2">Uploading image...</p>}
                {profileImg && (
                  <div className="relative w-20 h-20 mt-3 rounded-full overflow-hidden border border-outline-variant/20">
                    <Image src={profileImg} alt="Profile preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Profile Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "banner")}
                  className="w-full text-body-md text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-on-primary file:font-label-md file:text-label-md file:cursor-pointer hover:file:bg-primary/90"
                />
                {uploadingBanner && <p className="text-caption text-outline mt-2">Uploading banner...</p>}
                {profileBanner && (
                  <div className="relative w-full h-20 mt-3 rounded-xl overflow-hidden border border-outline-variant/20">
                    <Image src={profileBanner} alt="Banner preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">About Me</label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors text-body-md min-h-[150px] resize-y"
                placeholder="Write a short biography..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-full hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
