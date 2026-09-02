"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/blogs?search=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative flex items-center">
      {isOpen ? (
        <form onSubmit={handleSubmit} className="flex items-center group">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => !query && setIsOpen(false)}
            placeholder="Search blogs..."
            className="w-40 md:w-56 px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 text-sm focus:outline-none focus:border-middle transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-r-lg bg-middle text-white border border-middle hover:bg-[#f31e65ef] transition-colors cursor-pointer"
          >
            <FiSearch size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Search"
          className="text-primary hover:text-middle transition-colors p-2 cursor-pointer"
        >
          <FiSearch size={20} />
        </button>
      )}
    </div>
  );
}
