import Link from "next/link";

export default async function LeftSidebar() {
  return (
    <div className="mb-4 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
        </div>
        <div>
          <p className="text-headline-sm font-headline-sm font-bold text-primary leading-none">Nasacy</p>
          <p className="text-caption text-on-surface-variant">Curated thinking</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 bg-primary-container/10 text-primary font-bold shadow-sm rounded-xl group transition-all duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-label-md">Home</span>
        </Link>
        <Link href="/categories" className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 rounded-xl group">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-label-md">Discover</span>
        </Link>
        <Link href="/bookmarks" className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 rounded-xl group">
          <span className="material-symbols-outlined">bookmarks</span>
          <span className="text-label-md">Library</span>
        </Link>
        <Link href="/categories" className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 rounded-xl group">
          <span className="material-symbols-outlined">sell</span>
          <span className="text-label-md">Tags</span>
        </Link>
      </nav>

      <div className="mt-8 px-4 border-t border-outline-variant pt-6">
        <p className="text-label-sm font-bold text-outline mb-4 uppercase tracking-wider">Other</p>
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low px-3">
            <span className="material-symbols-outlined text-[20px]">gavel</span>
            <span className="text-label-sm">Code of Conduct</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low px-3">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span className="text-label-sm">Privacy Policy</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low px-3">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <span className="text-label-sm">Terms of Use</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
