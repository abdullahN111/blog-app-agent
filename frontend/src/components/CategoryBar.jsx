"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { categories } from "../../public/assets/blogRelatedData";
import { generateSlug } from "../utils/utils";

export default function CategoryBar() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const mobileMoreRef = useRef(null);

  const visibleCategories = categories.slice(0, 8);
  const moreCategories = categories.slice(8);
  const visibleMobileCategories = categories.slice(0, 5);
  const moreMobileCategories = categories.slice(5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (
        mobileMoreRef.current &&
        !mobileMoreRef.current.contains(event.target)
      ) {
        setIsMobileMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (category) =>
    pathname === `/blogs/category/${generateSlug(category)}`;

  return (
    <>
      <div className="hidden md:block border-t border-[#E4DFD7] bg-[#FAF8F5]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 relative">
            <span className="text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#85817A] pr-3 mr-2 border-r border-[#E4DFD7]">
              Sections
            </span>
            <Link
              href="/blogs"
              className={`px-3 py-1 text-xs font-mono-meta uppercase tracking-wider transition-colors ${
                pathname === "/blogs"
                  ? "bg-[#111110] text-[#FAF8F5] font-medium"
                  : "text-[#57544E] hover:text-[#111110] hover:bg-[#F3EFEA]"
              }`}
            >
              All
            </Link>

            {visibleCategories.map((category) => {
              const slug = generateSlug(category);
              const active = isActive(category);
              return (
                <Link
                  key={slug}
                  href={`/blogs/category/${slug}`}
                  className={`px-3 py-1 text-xs font-mono-meta uppercase tracking-wider whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#111110] text-[#FAF8F5] font-medium"
                      : "text-[#57544E] hover:text-[#111110] hover:bg-[#F3EFEA]"
                  }`}
                >
                  {category}
                </Link>
              );
            })}

            {moreCategories.length > 0 && (
              <div className="relative ml-auto" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono-meta uppercase tracking-wider text-[#111110] border border-[#E4DFD7] hover:border-[#111110] transition-colors cursor-pointer"
                >
                  More Sections
                  <FiChevronDown
                    className={`transition-transform ${isMoreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-[#FFFFFF] border border-[#111110] shadow-[4px_4px_0px_#111110] z-50 py-1">
                    {moreCategories.map((category) => {
                      const slug = generateSlug(category);
                      const active = isActive(category);
                      return (
                        <Link
                          key={slug}
                          href={`/blogs/category/${slug}`}
                          onClick={() => setIsMoreOpen(false)}
                          className={`block px-4 py-2 text-xs font-mono-meta uppercase tracking-wider transition-colors ${
                            active
                              ? "bg-[#111110] text-[#FAF8F5]"
                              : "text-[#111110] hover:bg-[#F3EFEA]"
                          }`}
                        >
                          {category}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-[#E4DFD7] bg-[#FAF8F5]">
        <div className="px-4 py-2.5 flex flex-wrap items-center gap-1.5 relative">
          {visibleMobileCategories.map((category) => {
            const active = isActive(category);
            return (
              <Link
                key={category}
                href={`/blogs/category/${generateSlug(category)}`}
                className={`px-2.5 py-1 border text-xs font-mono-meta uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[#111110] text-[#FAF8F5] border-[#111110]"
                    : "border-[#E4DFD7] text-[#57544E] hover:border-[#111110] hover:text-[#111110]"
                }`}
              >
                {category}
              </Link>
            );
          })}

          <div className="relative" ref={mobileMoreRef}>
            <button
              onClick={() => setIsMobileMoreOpen((v) => !v)}
              className="px-2.5 py-1 border border-[#111110] text-xs font-mono-meta uppercase tracking-wider text-[#111110] flex items-center gap-1 transition-colors"
            >
              More
              <FiChevronDown
                className={`transition-transform ${isMobileMoreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMobileMoreOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#FFFFFF] border border-[#111110] shadow-[4px_4px_0px_#111110] z-50 py-1">
                {moreMobileCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/blogs/category/${generateSlug(category)}`}
                    onClick={() => setIsMobileMoreOpen(false)}
                    className="block px-4 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}