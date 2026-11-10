"use client";

import Link from "next/link";
import { FiX, FiArrowUpRight } from "react-icons/fi";

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
            Please sign in with your Google account first to explore editorial tools and author permissions.
          </p>
        ) : (
          <div className="space-y-3 text-sm text-[#57544E] leading-relaxed">
            <p>
              Blogout includes an autonomous editorial agent that drafts structured long-form essays from your thesis and perspective.
            </p>
            <p>
              To protect API quotas on our live deployment, direct generation is currently restricted to verified editorial accounts.
            </p>
            <p className="text-[#111110] font-medium pt-1">
              Watch the complete studio workflow walkthrough below:
            </p>

            <Link
              href="https://www.youtube.com/watch?v=Xn-8I7QdmN8"
              target="_blank"
              className="mt-4 flex items-center justify-center gap-2 bg-[#C83E2B] py-3 px-5 text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider font-medium hover:bg-[#A63020] transition-colors"
            >
              <span>Watch Studio Walkthrough</span>
              <FiArrowUpRight size={16} />
            </Link>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border border-[#111110] bg-transparent py-2.5 text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
