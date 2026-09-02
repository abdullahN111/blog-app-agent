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
    <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
          <FiSearch className="text-gray-400 shrink-0" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs..."
            className="w-full bg-transparent px-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 px-4 py-2.5 rounded-full bg-middle text-white text-sm font-medium hover:bg-[#f31e65ef] transition-colors"
        >
          Go
        </button>
      </form>
    </div>
  );
}