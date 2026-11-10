"use client";

import Image from "next/image";
import Link from "next/link";
import heroImage from "../../public/assets/hero.png";
import { useSession } from "next-auth/react";
import { FiArrowUpRight, FiEdit3 } from "react-icons/fi";

export default function Hero() {
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    session?.user?.email === process.env.NEXT_PUBLIC_MOD_EMAIL;

  return (
    <section className="border-b border-[#111110] bg-[#FAF8F5]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 border border-[#111110] bg-[#F3EFEA] px-3 py-1">
              <span className="w-2 h-2 bg-[#C83E2B]" />
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#111110]">
                Vol. I — Perspectives &amp; Essays
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#111110] leading-[1.06] tracking-tight">
              Sharing Considered{" "}
              <span className="italic font-normal text-[#C83E2B]">
                Thoughts
              </span>{" "}
              With The World.
            </h1>

            <p className="text-base sm:text-lg text-[#57544E] max-w-xl leading-relaxed">
              Blogout is an independent digital publication and AI-assisted editorial studio built to turn raw perspectives into structured, enduring long-form writing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#C83E2B] transition-colors"
              >
                <span>Read The Archive</span>
                <FiArrowUpRight size={16} />
              </Link>

              {isAdmin ? (
                <Link
                  href="/create-blog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-[#111110] border border-[#111110] text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#F3EFEA] transition-colors"
                >
                  <FiEdit3 size={15} />
                  <span>Write Dispatch</span>
                </Link>
              ) : (
                <Link
                  href="mailto:myselfabdullah360@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-[#111110] border border-[#111110] text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#F3EFEA] transition-colors"
                >
                  <span>Letter to the Editor</span>
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative max-w-md mx-auto lg:ml-auto border border-[#111110] bg-[#F3EFEA] p-3 shadow-[6px_6px_0px_#111110]">
              <div className="border border-[#E4DFD7] bg-[#FAF8F5] overflow-hidden">
                <Image
                  src={heroImage}
                  alt="Editorial Portrait"
                  className="object-contain w-full h-auto"
                  priority
                />
              </div>
              <div className="pt-3 flex items-center justify-between text-[11px] font-mono-meta uppercase tracking-wider text-[#57544E]">
                <span>Fig 01. Founder&apos;s Desk</span>
                <span>Est. 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
