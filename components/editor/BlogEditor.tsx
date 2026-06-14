"use client"

import { useRef, useState, useCallback, useEffect } from "react";
import { publishPost, saveDraft, updatePost, createCategoryAction } from "@/app/actions";
import { CldImage } from "next-cloudinary";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  categories: Category[];
  post?: {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    published: boolean;
    categories?: Array<{ categoryId: string }>;
  };
  isAdmin?: boolean;
}

export default function BlogEditor({ categories, post, isAdmin = false }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl ?? null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Advanced formatting states
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [insertingBodyImage, setInsertingBodyImage] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Populate local categories when props change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Load editor content exactly once on mount to avoid the state re-render reversion bug
  useEffect(() => {
    if (editorRef.current && post?.content) {
      editorRef.current.innerHTML = post.content;
    }
  }, [post]);

  function execCmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) {
        setImageUrl(data.url);
        setImagePublicId(data.publicId ?? null);
        setImagePreview(data.publicId ?? data.url);
      } else {
        setUploadError(data.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImagePreview(null);
    setImagePublicId(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLink() {
    const url = prompt("Enter link URL:");
    if (url) execCmd("createLink", url);
  }

  // Heading toggling / styling on highlighted text
  function handleHeading() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const selectedText = range.toString();
        const h2 = document.createElement("h2");
        h2.className = "text-headline-md font-bold text-on-surface my-4 block";
        h2.innerHTML = selectedText;
        range.deleteContents();
        range.insertNode(h2);
      } else {
        execCmd("formatBlock", "h2");
      }
    } else {
      execCmd("formatBlock", "h2");
    }
  }

  // Custom styling blockquote on selection
  function handleQuote() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const selectedText = range.toString();
        const blockquote = document.createElement("blockquote");
        blockquote.className = "my-8 py-6 px-8 border-l-4 border-primary bg-surface-container-low rounded-r-xl italic font-body-lg text-on-surface-variant";
        blockquote.innerHTML = `"${selectedText}"`;
        range.deleteContents();
        range.insertNode(blockquote);
      } else {
        execCmd("formatBlock", "blockquote");
      }
    } else {
      execCmd("formatBlock", "blockquote");
    }
  }

  // Custom list generation from highlighted lines
  function handleList() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const selectedText = range.toString();
        const lines = selectedText.split("\n").filter(l => l.trim() !== "");
        const ul = document.createElement("ul");
        ul.className = "list-disc pl-6 my-4 space-y-1 text-on-surface-variant";
        lines.forEach(line => {
          const li = document.createElement("li");
          li.innerText = line;
          ul.appendChild(li);
        });
        range.deleteContents();
        range.insertNode(ul);
      } else {
        execCmd("insertUnorderedList");
      }
    } else {
      execCmd("insertUnorderedList");
    }
  }

  // Text size toggler (8px - 25px)
  function handleTextSize(size: string) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        span.style.lineHeight = "1.4";
        const content = range.extractContents();
        span.appendChild(content);
        range.insertNode(span);

        // Reset selection to the span
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      }
    }
  }

  // Code Block themed with Night Owl colors
  function handleCodeBlock() {
    const selection = window.getSelection();
    let codeText = "const solution = () => {\n  console.log('Night Owl coding style');\n};";
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        codeText = range.toString();
      }
    }
    const html = `<pre class="my-6 p-5 rounded-xl font-mono text-sm overflow-x-auto shadow-inner" style="background-color: #011627; color: #d6deeb; border-left: 4px solid #7fdbca; line-height: 1.5; text-align: left; display: block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"><code style="font-family: inherit; color: #d6deeb;">${codeText}</code></pre>`;
    document.execCommand("insertHTML", false, html);
  }

  // Image upload in content body
  function handleBodyImageClick() {
    bodyImageInputRef.current?.click();
  }

  async function handleBodyFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingBodyImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) {
        editorRef.current?.focus();
        const imgHtml = `<img src="${data.url}" alt="Body Image" class="my-6 max-w-full rounded-xl cursor-pointer hover:ring-2 hover:ring-primary transition-all inline-block" style="width: 100%; display: block; margin-left: auto; margin-right: auto;" />`;
        document.execCommand("insertHTML", false, imgHtml);
      } else {
        alert("Upload failed: " + (data.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error uploading image");
    } finally {
      setInsertingBodyImage(false);
      if (e.target) e.target.value = "";
    }
  }

  // Selected image sizing and placement
  function handleSelectedImageWidth(width: string) {
    if (!selectedImage) return;
    selectedImage.style.width = width;
  }

  function handleSelectedImageAlign(align: "left" | "center" | "right") {
    if (!selectedImage) return;
    selectedImage.style.display = "block";
    if (align === "left") {
      selectedImage.style.marginLeft = "0";
      selectedImage.style.marginRight = "auto";
    } else if (align === "right") {
      selectedImage.style.marginLeft = "auto";
      selectedImage.style.marginRight = "0";
    } else {
      selectedImage.style.marginLeft = "auto";
      selectedImage.style.marginRight = "auto";
    }
  }

  function handleSelectedImageDelete() {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
  }

  // Dynamic category creation (admin only)
  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const newCat = await createCategoryAction(newCategoryName);
      if (newCat) {
        setLocalCategories(prev => [...prev, newCat]);
        setNewCategoryName("");
        setShowAddCategory(false);
        setTimeout(() => {
          const select = document.querySelector<HTMLSelectElement>("select[name='categoryId']");
          if (select) select.value = newCat.id;
        }, 100);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit(published: boolean) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const title = titleRef.current?.value ?? "";
      const content = editorRef.current?.innerHTML ?? "";

      if (!title.trim()) {
        alert("Please enter a title.");
        setSubmitting(false);
        return;
      }
      if (!content.trim() || content === "<br>") {
        alert("Please write some content.");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      formData.set("imageUrl", imageUrl);
      formData.set("published", String(published));

      const categorySelect = document.querySelector<HTMLSelectElement>("select[name='categoryId']");
      if (categorySelect?.value) {
        formData.set("categoryId", categorySelect.value);
      }

      if (post) {
        await updatePost(post.id, formData);
      } else if (published) {
        await publishPost(formData);
      } else {
        await saveDraft(formData);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const resizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "";
    el.style.height = el.scrollHeight + "px";
  }, []);

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      setSelectedImage(target as HTMLImageElement);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
      {/* Editor Column */}
      <section className="max-w-content-max mx-auto lg:mx-0 w-full space-y-8">
        {/* Cover Image Upload Zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        {/* Body Image Upload Zone */}
        <input
          ref={bodyImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBodyFileSelect}
        />

        {imagePreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-container-lowest group">
            {imagePublicId ? (
              <CldImage
                key={imagePublicId}
                src={imagePublicId}
                alt="Cover"
                width="1600"
                height="900"
                crop={{
                  type: "auto",
                  source: true,
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img key={imagePreview} src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="bg-white/90 text-on-surface px-4 py-2 rounded-full font-label-md text-label-md hover:bg-white transition-all"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-500/90 text-white px-4 py-2 rounded-full font-label-md text-label-md hover:bg-red-500 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-label-md text-label-md">Uploading...</span>
              </div>
            )}
            {uploadError && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white px-4 py-2 text-sm">
                {uploadError}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleImageClick}
            className="group relative w-full aspect-video rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-surface-container-lowest overflow-hidden cursor-pointer"
          >
            <div className="text-center space-y-2 group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-outline text-4xl group-hover:text-primary">
                {uploading ? "upload" : "add_photo_alternate"}
              </span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                {uploading ? "Uploading..." : "Drag and drop cover image"}
              </p>
              <p className="font-caption text-caption text-outline">Recommended size: 1600x900px</p>
            </div>
            {uploadError && (
              <p className="mt-2 text-red-500 text-caption text-center">{uploadError}</p>
            )}
          </div>
        )}

        {/* Title Input */}
        <div className="pb-4 border-b border-outline-variant/20">
          <textarea
            ref={titleRef}
            className="w-full bg-transparent border-none p-0 text-[42px] md:text-[48px] font-bold text-on-surface placeholder:text-outline-variant/60 resize-none focus:ring-0 focus:outline-none overflow-hidden leading-tight"
            placeholder="Article Title"
            defaultValue={post?.title ?? ""}
            rows={1}
            required
            onInput={resizeTitle}
          />
        </div>

        {/* Floating Image Manipulation Bar */}
        {selectedImage && (
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 shadow-md flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-caption font-bold text-outline uppercase tracking-wider mr-2">Image Size:</span>
              <button
                type="button"
                onClick={() => handleSelectedImageWidth("25%")}
                className="px-2.5 py-1 text-xs rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors font-medium"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleSelectedImageWidth("50%")}
                className="px-2.5 py-1 text-xs rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors font-medium"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleSelectedImageWidth("75%")}
                className="px-2.5 py-1 text-xs rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors font-medium"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleSelectedImageWidth("100%")}
                className="px-2.5 py-1 text-xs rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors font-medium"
              >
                100%
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption font-bold text-outline uppercase tracking-wider mr-2">Align:</span>
              <button
                type="button"
                onClick={() => handleSelectedImageAlign("left")}
                className="p-1 rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors"
                title="Align Left"
              >
                <span className="material-symbols-outlined text-[18px]">format_align_left</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectedImageAlign("center")}
                className="p-1 rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors"
                title="Align Center"
              >
                <span className="material-symbols-outlined text-[18px]">format_align_center</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectedImageAlign("right")}
                className="p-1 rounded bg-surface hover:bg-primary hover:text-on-primary transition-colors"
                title="Align Right"
              >
                <span className="material-symbols-outlined text-[18px]">format_align_right</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleSelectedImageDelete}
              className="p-1 rounded bg-error/10 hover:bg-error text-error hover:text-on-error transition-colors ml-auto"
              title="Delete Image"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}

        {/* Content Editor */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 p-2 border border-outline-variant/30 rounded-lg bg-surface sticky top-20 z-10 shadow-sm flex-wrap">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCmd("bold"); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="Bold"
            >
              <span className="material-symbols-outlined">format_bold</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCmd("italic"); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="Italic"
            >
              <span className="material-symbols-outlined">format_italic</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCmd("underline"); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="Underline"
            >
              <span className="material-symbols-outlined">format_underlined</span>
            </button>
            <div className="w-px h-6 bg-outline-variant/30 mx-1" />
            
            {/* Text size selector dropdown */}
            <div className="flex items-center gap-1 px-1">
              <span className="material-symbols-outlined text-outline text-[18px]">format_size</span>
              <select
                onChange={(e) => { handleTextSize(e.target.value); e.target.value = ""; }}
                className="bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-on-surface-variant font-medium cursor-pointer py-1"
                defaultValue=""
              >
                <option value="" disabled>Size</option>
                {Array.from({ length: 18 }, (_, i) => i + 8).map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-outline-variant/30 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading(); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface font-bold text-sm"
              title="Heading"
            >
              H2
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleList(); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="List"
            >
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleQuote(); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="Quote"
            >
              <span className="material-symbols-outlined">format_quote</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleCodeBlock(); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface font-bold text-sm"
              title="Code Preview (Night Owl Theme)"
            >
              <span className="material-symbols-outlined">code</span>
            </button>
            
            <div className="w-px h-6 bg-outline-variant/30 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              title="Link"
            >
              <span className="material-symbols-outlined">link</span>
            </button>
            <button
              type="button"
              onClick={handleBodyImageClick}
              disabled={insertingBodyImage}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface disabled:opacity-50"
              title="Insert Image to Body"
            >
              <span className="material-symbols-outlined">{insertingBodyImage ? "hourglass_top" : "image"}</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCmd("removeFormat"); }}
              className="p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface ml-auto"
              title="Unedit / Clear Formatting"
            >
              <span className="material-symbols-outlined">format_clear</span>
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onClick={handleEditorClick}
            className="prose prose-lg w-full min-h-[500px] text-body-lg font-body-lg text-on-surface focus:outline-none leading-relaxed bg-transparent border border-outline-variant/20 rounded-xl p-6 empty:before:text-outline-variant empty:before:content-[attr(data-placeholder)]"
            data-placeholder="Tell your story..."
            role="textbox"
            aria-multiline="true"
            suppressContentEditableWarning
          />
        </div>

        {/* Mobile Publish */}
        <div className="lg:hidden bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 shadow-sm space-y-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : post ? "Update Post" : "Publish Post"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 border border-outline-variant text-on-surface-variant font-label-md text-label-md py-4 rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : post ? "Save as Draft" : "Save Draft"}
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar Column */}
      <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
        {/* Publish Card */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 shadow-sm space-y-6">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Publish</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">visibility</span> Visibility
              </span>
              <span className="font-semibold text-primary">Public</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">schedule</span> Schedule
              </span>
              <span className="font-semibold">Now</span>
            </div>
          </div>
          <div className="pt-4 space-y-3 hidden lg:block">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : post ? "Update Post" : "Publish Post"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full border border-outline-variant text-on-surface-variant font-label-md text-label-md py-3 rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : post ? "Save as Draft" : "Save as Draft"}
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-outline uppercase tracking-wider">Category</label>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="flex items-center justify-center p-1 rounded hover:bg-surface-container transition-all"
                  title="Add Category"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">add</span>
                </button>
              )}
            </div>

            {showAddCategory && isAdmin && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  placeholder="Category Name"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-2.5 py-1 text-xs text-on-surface-variant hover:bg-surface-container rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="px-2.5 py-1 text-xs bg-primary text-on-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {addingCategory ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}

            <select
              name="categoryId"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Select a category</option>
              {localCategories.map((cat) => (
                <option key={cat.id} value={cat.id} defaultChecked={post?.categories?.[0]?.categoryId === cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="font-label-md text-label-md text-outline uppercase tracking-wider">Tags</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. design, tech, AI"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-caption text-outline">Separate tags with commas</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
