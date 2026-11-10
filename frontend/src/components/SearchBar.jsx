"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !query
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/blogs?search=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center border transition-all duration-200 ease-out ${
            isOpen
              ? "w-52 md:w-64 border-[#111110] bg-[#FFFFFF]"
              : "w-10 border-[#E4DFD7] hover:border-[#111110] bg-[#FAF8F5]"
          }`}
        >
          <button
            type={isOpen ? "submit" : "button"}
            onClick={() => !isOpen && setIsOpen(true)}
            aria-label="Search"
            className="flex items-center justify-center w-9 h-9 shrink-0 text-[#111110] hover:text-[#C83E2B] transition-colors cursor-pointer"
          >
            <FiSearch size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search archive..."
            className={`bg-transparent text-xs font-mono-meta text-[#111110] placeholder:text-[#85817A] focus:outline-none transition-all duration-200 ${
              isOpen ? "w-full opacity-100 pr-2" : "w-0 opacity-0"
            }`}
          />

          {isOpen && query && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-7 h-7 mr-1 shrink-0 text-[#85817A] hover:text-[#111110] transition-colors cursor-pointer"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}