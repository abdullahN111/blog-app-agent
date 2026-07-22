"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/assets/logo.png";
import { FiMenu, FiChevronDown, FiUser } from "react-icons/fi";
import { IoIosCreate } from "react-icons/io";
import { categories } from "../../public/assets/blogRelatedData";
import { generateSlug } from "../utils/utils";
import CreateBlogModal from "./CreateBlogModal";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileBlogsOpen, setIsMobileBlogsOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const visibleCategories = categories.slice(0, 6);
  const moreCategories = categories.slice(6);
  const visibleMobileCategories = categories.slice(0, 5);
  const moreMobileCategories = categories.slice(5);

  const toggleMore = () => setIsMoreOpen(!isMoreOpen);

  // console.log(session.id_token);

  const isAdmin =
    session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    session?.user?.email === process.env.NEXT_PUBLIC_MOD_EMAIL;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileBlogs = () => {
    setIsMobileBlogsOpen(!isMobileBlogsOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showCategoryBar =
    pathname === "/" ||
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/category/");

  // console.log({
  //   email: session?.user?.email,
  //   isAdmin,
  // });

  return (
    <header className="bg-white shadow-md relative">
      <nav className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 py-1">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="Blogout Logo" width={75} height={75} />
            <span className="font-semibold text-[22px] sm:text-[23px] md:text-2xl text-primary">
              Blogout
            </span>
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-7 lg:gap-8">
          <li>
            <Link
              href="/"
              className="text-primary hover:text-middle transition-colors text-base md:text-[17px]"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/blogs"
              className="text-primary hover:text-middle transition-colors text-base md:text-[17px]"
            >
              Blogs
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className="text-primary hover:text-middle transition-colors text-base md:text-[17px]"
            >
              About
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href={isAdmin ? "/create-blog" : "#"}
            onClick={(e) => {
              if (!isAdmin) {
                e.preventDefault();
                setShowCreateModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-middle text-white hover:bg-[#f31e65ef] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <IoIosCreate size={20} />
            <span className="font-medium text-sm">Create Blog</span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            {session ? (
              <>
                {session.user?.image && (
                  <Image
                    onClick={toggleAccountDropdown}
                    src={session.user.image}
                    alt="User profile"
                    width={38}
                    height={38}
                    className="rounded-full cursor-pointer"
                    aria-label="Account"
                  />
                )}
              </>
            ) : (
              <button
                onClick={toggleAccountDropdown}
                className="text-middle transition-colors hover:scale-110 duration-200 cursor-pointer mt-2"
                aria-label="Account"
              >
                <FiUser size={28} />
              </button>
            )}

            <div
              className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200
                transform origin-top transition-all duration-200 ease-out
                ${
                  isAccountDropdownOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
              <div className="p-4">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="User profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm">
                          {session.user?.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <Link
                        href="/account"
                        className="block text-middle hover:text-middle-dark text-sm py-1 transition-colors duration-200"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        Manage Account
                      </Link>
                    </div>

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left text-red-600 hover:text-red-800 text-sm py-1 transition-colors duration-200 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                      You are not signed in.
                    </p>
                    <button
                      onClick={() => signIn("google")}
                      className="w-full bg-middle text-white py-2 px-4 rounded-md hover:bg-middle-dark transition-colors duration-200 text-sm cursor-pointer"
                    >
                      Sign in with Google
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button
            className="flex flex-col justify-center items-center w-10 h-10 py-[6px] rounded cursor-pointer"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <FiMenu className="text-4xl" />
          </button>
        </div>
      </nav>

      {showCategoryBar && (
        <>
          {/* Desktop Categories */}

          <div className="hidden md:block border-t border-gray-200">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-6 py-3 relative">
                {visibleCategories.map((category) => {
                  const slug = generateSlug(category);

                  return (
                    <Link
                      key={slug}
                      href={`/blogs/category/${slug}`}
                      className="text-sm text-primary hover:text-middle transition-colors whitespace-nowrap"
                    >
                      {category}
                    </Link>
                  );
                })}

                {moreCategories.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={toggleMore}
                      className="flex items-center gap-1 text-sm text-primary hover:text-middle"
                    >
                      More
                      <FiChevronDown
                        className={`transition-transform ${
                          isMoreOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isMoreOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 py-2">
                        {moreCategories.map((category) => {
                          const slug = generateSlug(category);

                          return (
                            <Link
                              key={slug}
                              href={`/blogs/category/${slug}`}
                              onClick={() => setIsMoreOpen(false)}
                              className="block px-4 py-2 hover:bg-middle hover:text-white transition-colors"
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

          {/* Mobile Categories */}
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 flex flex-wrap items-center gap-2 relative">
              {visibleMobileCategories.map((category) => (
                <Link
                  key={category}
                  href={`/blogs/category/${generateSlug(category)}`}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-primary hover:bg-middle hover:text-white hover:border-middle transition-colors"
                >
                  {category}
                </Link>
              ))}

              <div className="relative">
                <button
                  onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-primary flex items-center gap-1 hover:bg-middle hover:text-white hover:border-middle transition-colors"
                >
                  More
                  <FiChevronDown
                    className={`transition-transform ${
                      isMobileMoreOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMobileMoreOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border z-50 py-2">
                    {" "}
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
      )}
      <div
        className={`md:hidden fixed inset-0 bg-black opacity-0 z-40 transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? "opacity-30" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      ></div>

      <div
        className={`md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleMenu}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center mb-4 border-b pb-4 border-gray-500">
            <Link href="/" className="flex items-center">
              <Image src={logo} alt="Blogout Logo" width={70} height={70} />
              <span className="font-semibold text-xl sm:text-[22px] text-primary">
                Blogout
              </span>
            </Link>
          </div>

          <ul className="flex flex-col mb-4">
            <li>
              <Link
                href="/"
                className="text-primary hover:text-middle transition-colors text-[17px] block py-[6px]"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/blogs"
                className="text-primary hover:text-middle transition-colors text-[17px] block py-[6px]"
                onClick={toggleMenu}
              >
                Blogs
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-primary hover:text-middle transition-colors text-[17px] block py-[6px]"
                onClick={toggleMenu}
              >
                About
              </Link>
            </li>
          </ul>

          <div className="py-4 border-t border-gray-500">
            <Link
              href={isAdmin ? "/create-blog" : "#"}
              onClick={(e) => {
                if (!isAdmin) {
                  e.preventDefault();
                  toggleMenu();

                  setTimeout(() => {
                    setShowCreateModal(true);
                  }, 250);

                  return;
                }

                toggleMenu();
              }}
              className="flex items-center justify-between px-4 py-3 mb-6 rounded-xl bg-middle/10 border border-middle/20 hover:bg-middle hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-middle text-white flex items-center justify-center group-hover:bg-white group-hover:text-middle transition-colors">
                  <IoIosCreate size={20} />
                </div>

                <div>
                  <p className="font-semibold">Create Blog</p>
                  <p className="text-xs text-gray-500 group-hover:text-white/80">
                    AI Blog Generator
                  </p>
                </div>
              </div>

              <FiChevronDown className="-rotate-90" />
            </Link>

            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="User profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      {session.user?.name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/account"
                  className="block text-middle hover:text-middle-dark text-sm py-1 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Manage Account
                </Link>

                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-800 text-sm py-1 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="w-full bg-middle text-white py-2 px-4 rounded-md hover:bg-middle-dark transition-colors duration-200 text-sm cursor-pointer"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </div>
      <CreateBlogModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        loggedIn={!!session}
      />
    </header>
  );
}
