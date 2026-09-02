"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { categories } from "../../public/assets/blogRelatedData/";
import { generateSlug } from "../utils/utils";

export default function CategoryBar() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const mobileMoreRef = useRef(null);

  const visibleCategories = categories.slice(0, 6);
  const moreCategories = categories.slice(6);
  const visibleMobileCategories = categories.slice(0, 5);
  const moreMobileCategories = categories.slice(5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(event.target)) {
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
    
      <div className="hidden md:block border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 relative">
            {visibleCategories.map((category) => {
              const slug = generateSlug(category);
              const active = isActive(category);
              return (
                <Link
                  key={slug}
                  href={`/blogs/category/${slug}`}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-middle text-white font-medium"
                      : "text-primary hover:bg-gray-100"
                  }`}
                >
                  {category}
                </Link>
              );
            })}

            {moreCategories.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen((v) => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-primary hover:bg-gray-100 transition-colors"
                >
                  More
                  <FiChevronDown
                    className={`transition-transform ${isMoreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 py-2">
                    {moreCategories.map((category) => {
                      const slug = generateSlug(category);
                      const active = isActive(category);
                      return (
                        <Link
                          key={slug}
                          href={`/blogs/category/${slug}`}
                          onClick={() => setIsMoreOpen(false)}
                          className={`block px-4 py-2 transition-colors ${
                            active
                              ? "bg-middle text-white"
                              : "hover:bg-middle hover:text-white"
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

   
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-3 flex flex-wrap items-center gap-2 relative">
          {visibleMobileCategories.map((category) => {
            const active = isActive(category);
            return (
              <Link
                key={category}
                href={`/blogs/category/${generateSlug(category)}`}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active
                    ? "bg-middle text-white border-middle"
                    : "border-gray-300 text-primary hover:bg-middle hover:text-white hover:border-middle"
                }`}
              >
                {category}
              </Link>
            );
          })}

          <div className="relative" ref={mobileMoreRef}>
            <button
              onClick={() => setIsMobileMoreOpen((v) => !v)}
              className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-primary flex items-center gap-1 hover:bg-middle hover:text-white hover:border-middle transition-colors"
            >
              More
              <FiChevronDown
                className={`transition-transform ${isMobileMoreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMobileMoreOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border z-50 py-2">
                {moreMobileCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/blogs/category/${generateSlug(category)}`}
                    onClick={() => setIsMobileMoreOpen(false)}
                    className="block px-4 py-2 hover:bg-middle hover:text-white transition-colors"
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