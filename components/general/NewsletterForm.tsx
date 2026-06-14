"use client"

export default function NewsletterForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <input
        className="w-full px-4 py-3 rounded-lg bg-on-primary/10 border border-on-primary/20 placeholder:text-on-primary/50 text-on-primary focus:outline-none focus:ring-2 focus:ring-on-primary/30 transition-all"
        placeholder="your@email.com"
        type="email"
      />
      <button
        className="w-full py-3 bg-on-primary text-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-surface-bright active:scale-95 transition-all"
        type="submit"
      >
        Subscribe Now
      </button>
    </form>
  );
}
