"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

export default function MobileSearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/blogs?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-[#E4DFD7] bg-[#FAF8F5] px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center flex-1 bg-[#FFFFFF] border border-[#111110] px-3 py-2">
          <FiSearch className="text-[#85817A] shrink-0" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search archive..."
            className="w-full bg-transparent px-2.5 text-xs font-mono-meta text-[#111110] placeholder:text-[#85817A] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#85817A] hover:text-[#111110] shrink-0"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 px-4 py-2 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider hover:bg-[#C83E2B] transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}