"use client";

import Link from "next/link";
import Image from "next/image";
import { FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";
import logo from "../../public/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-[#111110] bg-[#FAF8F5] text-[#111110] mt-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src={logo} alt="Blogout Logo" width={38} height={38} />
            <span className="font-editorial font-bold text-2xl tracking-tight text-[#111110]">
              Blogout.
            </span>
          </Link>
          <p className="text-xs font-mono-meta text-[#57544E] max-w-sm">
            Independent digital publication &amp; AI-assisted editorial engine.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6 text-xs font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
          <Link href="/" className="hover:text-[#111110] transition-colors">
            Front Page
          </Link>
          <Link href="/blogs" className="hover:text-[#111110] transition-colors">
            Archive
          </Link>
          <Link href="/about" className="hover:text-[#111110] transition-colors">
            Masthead
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-[#111110] transition-colors"
          >
            Privacy Policy
          </Link>
        </nav>

        <div className="flex flex-col md:items-end gap-3">
          <div className="flex gap-4 text-[#111110]">
            <Link
              href="https://www.linkedin.com/in/m-abdullah-nadeem/"
              target="_blank"
              aria-label="LinkedIn"
              className="hover:text-[#C83E2B] transition-colors"
            >
              <FaLinkedin size={18} />
            </Link>
            <Link
              href="https://www.instagram.com/i_abdullahn/"
              target="_blank"
              aria-label="Instagram"
              className="hover:text-[#C83E2B] transition-colors"
            >
              <FaInstagram size={18} />
            </Link>
            <Link
              href="mailto:myselfabdullah360@gmail.com"
              aria-label="Email"
              className="hover:text-[#C83E2B] transition-colors"
            >
              <FaEnvelope size={18} />
            </Link>
          </div>
          <p className="text-xs font-mono-meta text-[#85817A]">
            © {new Date().getFullYear()} Blogout Publication. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
