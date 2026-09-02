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
          className={`flex items-center bg-gray-50 border rounded-full transition-all duration-300 ease-out ${
            isOpen
              ? "w-44 md:w-64 border-gray-200 ring-1 ring-middle/20 bg-white"
              : "w-10 border-transparent"
          }`}
        >
          <button
            type={isOpen ? "submit" : "button"}
            onClick={() => !isOpen && setIsOpen(true)}
            aria-label="Search"
            className="flex items-center justify-center w-10 h-10 shrink-0 text-gray-500 hover:text-middle transition-colors cursor-pointer"
          >
            <FiSearch size={18} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs..."
            className={`bg-transparent text-sm text-primary placeholder:text-gray-400 focus:outline-none transition-all duration-300 ${
              isOpen ? "w-full opacity-100 pr-2" : "w-0 opacity-0"
            }`}
          />

          {isOpen && query && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-8 h-8 mr-1 shrink-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FiX size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}