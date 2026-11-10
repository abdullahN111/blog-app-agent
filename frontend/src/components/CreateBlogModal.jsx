"use client";

import Link from "next/link";
import { FiX, FiArrowUpRight, FiArrowRight } from "react-icons/fi";

export default function CreateBlogModal({ open, onClose, loggedIn }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111110]/60 p-4">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#111110] p-8 shadow-[8px_8px_0px_#111110]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 border border-[#E4DFD7] flex items-center justify-center text-[#57544E] hover:text-[#111110] hover:border-[#111110] cursor-pointer"
          aria-label="Close modal"
        >
          <FiX size={18} />
        </button>

        <span className="inline-block font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B] mb-2">
          Editorial Studio Access
        </span>

        <h2 className="font-editorial text-3xl font-bold text-[#111110] mb-4">
          AI Dispatch Generator
        </h2>

        {!loggedIn ? (
          <p className="text-[#57544E] text-sm leading-relaxed">
            Please sign in with your Google account first to explore editorial tools, custom agent personas, and author permissions.
          </p>
        ) : (
          <div className="space-y-3 text-sm text-[#57544E] leading-relaxed">
            <p>
              Blogout includes an autonomous editorial agent that drafts structured long-form essays from your thesis and perspective.
            </p>
            <p>
              Every registered user now receives a protected daily studio quota (5 generations / 24h) or can connect a personal free Google AI Studio key for unlimited generations.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <Link
                href="/create-blog"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 bg-[#111110] py-3 px-4 text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider font-medium hover:bg-[#C83E2B] transition-colors"
              >
                <span>Open AI Studio</span>
                <FiArrowRight size={15} />
              </Link>

              <Link
                href="https://www.youtube.com/watch?v=Xn-8I7QdmN8"
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 border border-[#111110] bg-[#FFFFFF] py-3 px-4 text-[#111110] text-xs font-mono-meta uppercase tracking-wider font-medium hover:bg-[#F3EFEA] transition-colors"
              >
                <span>Watch Demo</span>
                <FiArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border border-[#E4DFD7] bg-transparent py-2.5 text-xs font-mono-meta uppercase tracking-wider text-[#57544E] hover:text-[#111110] hover:border-[#111110] transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
