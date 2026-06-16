"use client";

import { useState } from "react";
import Image from "next/image";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "insighthub/categories");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setIsPending(true);
    setError(null);
    try {
      await createCategoryAction(name.trim(), imageUrl || undefined);
      setName("");
      setImageUrl("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!name.trim()) return;
    setIsPending(true);
    setError(null);
    try {
      await updateCategoryAction(id, name.trim(), imageUrl || undefined);
      setEditingId(null);
      setName("");
      setImageUrl("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setImageUrl(cat.imageUrl || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setImageUrl("");
    setError(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-error-container/20 text-error rounded-xl font-label-md text-label-md">{error}</div>
      )}

      {/* Create / Edit Form */}
      <section className="bg-surface-container-lowest glass-card rounded-2xl shadow-sm border border-outline-variant/30 p-6">
        <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-4">
          {editingId ? "Edit Category" : "Create Category"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors text-body-md"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-body-md text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-on-primary file:font-label-md file:text-label-md file:cursor-pointer hover:file:bg-primary/90"
            />
            {uploading && <p className="text-caption text-outline mt-2">Uploading image...</p>}
            {imageUrl && (
              <div className="relative w-32 h-20 mt-3 rounded-lg overflow-hidden border border-outline-variant/20">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
              disabled={!name.trim() || isPending || uploading}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? "Saving..." : editingId ? "Update Category" : "Create Category"}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container-highest transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category List */}
      <section className="bg-surface-container-lowest glass-card rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-white/40">
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">All Categories ({categories.length})</h3>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant/60 text-body-md">No categories yet.</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low/50 transition-colors">
                <div className="flex items-center gap-4">
                  {cat.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/20">
                      <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-outline">category</span>
                    </div>
                  )}
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">{cat.name}</span>
                    <span className="font-caption text-caption text-outline">/{cat.slug}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        try {
                          await deleteCategoryAction(cat.id);
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }
                    }}
                    className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
