"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/assets/logo.png";
import {
  FiMenu,
  FiChevronRight,
  FiUser,
  FiSearch,
  FiHome,
  FiBookOpen,
  FiInfo,
  FiPlus,
  FiX,
} from "react-icons/fi";
import CreateBlogModal from "./CreateBlogModal";
import { usePathname } from "next/navigation";
import CategoryBar from "./CategoryBar";
import SearchBar from "./SearchBar";
import MobileSearchBar from "./MobileSearchBar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const isAdmin =
    session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    session?.user?.email === process.env.NEXT_PUBLIC_MOD_EMAIL;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  const navItems = [
    { href: "/", label: "Front Page", icon: FiHome },
    { href: "/blogs", label: "Archive", icon: FiBookOpen },
    { href: "/about", label: "Masthead", icon: FiInfo },
  ];

  return (
    <header className="bg-[#FAF8F5] border-b border-[#111110] sticky top-0 z-40">
      {/* Top editorial dateline strip */}
      <div className="hidden md:block border-b border-[#E4DFD7] bg-[#F3EFEA]/70">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
          <span>Independent Journal &amp; AI Editorial Studio</span>
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <nav className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 md:h-20">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src={logo}
              alt="Blogout Logo"
              width={44}
              height={44}
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-editorial font-bold text-2xl md:text-[28px] tracking-tight leading-none text-[#111110]">
                Blogout.
              </span>
            </div>
          </Link>

          <ul className="hidden md:flex items-center gap-1 border-l border-[#E4DFD7] pl-6">
            {navItems.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-[#111110] font-semibold underline decoration-[#C83E2B] decoration-2 underline-offset-8"
                        : "text-[#57544E] hover:text-[#111110]"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <SearchBar />

          <Link
            href={isAdmin ? "/create-blog" : "#"}
            onClick={(e) => {
              if (!isAdmin) {
                e.preventDefault();
                setShowCreateModal(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-[0.12em] font-medium hover:bg-[#C83E2B] transition-colors border border-[#111110]"
          >
            <FiPlus size={15} />
            <span>Create Blog</span>
          </Link>

          <div className="relative pl-2 border-l border-[#E4DFD7]" ref={dropdownRef}>
            {session ? (
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center gap-2 py-1 px-1.5 hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                aria-label="Account"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User profile"
                    width={34}
                    height={34}
                    className="border border-[#111110]"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#111110] text-[#FAF8F5] flex items-center justify-center text-xs font-mono-meta">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={toggleAccountDropdown}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#111110] border border-[#E4DFD7] hover:border-[#111110] transition-colors cursor-pointer"
                aria-label="Account"
              >
                <FiUser size={15} />
                <span>Sign In</span>
              </button>
            )}

            <div
              className={`absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] z-50 border border-[#111110] shadow-[4px_4px_0px_#111110]
                transform origin-top transition-all duration-150 ease-out
                ${
                  isAccountDropdownOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
              <div className="p-5">
                {session ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#E4DFD7]">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="User profile"
                          width={40}
                          height={40}
                          className="border border-[#111110]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#111110] truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-[#57544E] text-xs font-mono-meta truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/account"
                        className="flex items-center justify-between text-[#111110] hover:text-[#C83E2B] text-sm font-medium py-1.5 transition-colors"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        <span>{isAdmin ? "Editorial Desk & Account" : "Saved Reading List"}</span>
                        <FiChevronRight size={15} />
                      </Link>
                    </div>

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left pt-3 border-t border-[#E4DFD7] text-[#C83E2B] hover:text-[#A63020] text-xs font-mono-meta uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="font-editorial text-lg font-semibold text-[#111110]">
                        Reader &amp; Author Access
                      </p>
                      <p className="text-[#57544E] text-xs mt-1 leading-relaxed">
                        Sign in to curate your reading list, join discussions, or access the editorial studio.
                      </p>
                    </div>
                    <button
                      onClick={() => signIn("google")}
                      className="w-full bg-[#111110] text-[#FAF8F5] py-2.5 px-4 hover:bg-[#C83E2B] transition-colors text-xs font-mono-meta uppercase tracking-wider cursor-pointer"
                    >
                      Continue with Google
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1.5">
          <button
            onClick={() => setIsMobileSearchOpen((v) => !v)}
            aria-label="Search"
            className={`flex items-center justify-center w-10 h-10 border transition-colors cursor-pointer ${
              isMobileSearchOpen
                ? "border-[#111110] bg-[#111110] text-[#FAF8F5]"
                : "border-[#E4DFD7] text-[#111110] hover:border-[#111110]"
            }`}
          >
            <FiSearch size={18} />
          </button>

          <button
            className="flex items-center justify-center w-10 h-10 border border-[#E4DFD7] text-[#111110] hover:border-[#111110] transition-colors cursor-pointer"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </nav>

      <MobileSearchBar
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      {showCategoryBar && <CategoryBar />}

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden fixed inset-0 bg-[#111110]/40 z-40 transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      <div
        className={`md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#FAF8F5] border-l border-[#111110] z-50 transform transition-transform duration-200 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4DFD7]">
            <Link href="/" className="flex items-center gap-2" onClick={toggleMenu}>
              <Image src={logo} alt="Blogout Logo" width={36} height={36} />
              <span className="font-editorial font-bold text-xl text-[#111110]">
                Blogout.
              </span>
            </Link>

            <button
              onClick={toggleMenu}
              className="w-9 h-9 border border-[#E4DFD7] flex items-center justify-center text-[#111110] hover:border-[#111110]"
              aria-label="Close menu"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="py-5 border-b border-[#E4DFD7]">
            {session ? (
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="User profile"
                    width={44}
                    height={44}
                    className="border border-[#111110]"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#111110] truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-[#57544E] text-xs font-mono-meta truncate">
                    {session.user?.email}
                  </p>
                </div>
                <Link
                  href="/account"
                  onClick={toggleMenu}
                  className="shrink-0 text-xs font-mono-meta uppercase tracking-wider text-[#C83E2B] underline underline-offset-4"
                >
                  Desk
                </Link>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="w-full bg-[#111110] text-[#FAF8F5] py-3 px-4 font-mono-meta text-xs uppercase tracking-wider hover:bg-[#C83E2B] transition-colors cursor-pointer"
              >
                Sign in with Google
              </button>
            )}
          </div>

          <ul className="flex flex-col py-4 border-b border-[#E4DFD7]">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={toggleMenu}
                    className={`flex items-center justify-between py-3 px-2 text-base font-medium transition-colors ${
                      active
                        ? "text-[#C83E2B] font-semibold"
                        : "text-[#111110] hover:text-[#C83E2B]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={17} />
                      {label}
                    </span>
                    <FiChevronRight size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="py-5">
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
              className="flex items-center justify-between p-4 bg-[#111110] text-[#FAF8F5] hover:bg-[#C83E2B] transition-colors"
            >
              <div>
                <p className="font-mono-meta text-xs uppercase tracking-widest text-[#FAF8F5]/70">
                  Editorial Studio
                </p>
                <p className="font-editorial text-lg font-semibold mt-0.5">
                  Create New Dispatch
                </p>
              </div>
              <FiPlus size={20} />
            </Link>
          </div>

          {session && (
            <button
              onClick={() => signOut()}
              className="mt-auto text-left text-[#C83E2B] text-xs font-mono-meta uppercase tracking-wider py-3 border-t border-[#E4DFD7] cursor-pointer"
            >
              Sign Out
            </button>
          )}
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
