"use client";

import Image from "next/image";
import Link from "next/link";
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
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 border border-[#111110] bg-[#F3EFEA] px-3 py-1">
              <span className="w-2 h-2 bg-[#C83E2B]" />
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#111110]">
                Vol. I — Perspectives &amp; Essays
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[62px] font-bold text-[#111110] leading-[1.06] tracking-tight">
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

          <div className="lg:col-span-6">
            <figure className="relative w-full border border-[#111110] bg-[#F3EFEA] p-3 sm:p-4 shadow-[8px_8px_0px_#111110]">
              <div className="border border-[#111110] bg-[#FAF8F5] overflow-hidden">
                <Image
                  src="/assets/editorial-hero.jpg"
                  alt="The Editorial Writer's Desk — Typewriter, Broadsheet & Lamp"
                  width={1200}
                  height={675}
                  className="object-cover w-full h-auto"
                  priority
                />
              </div>
              <figcaption className="pt-3 flex items-center justify-between text-[11px] font-mono-meta uppercase tracking-wider text-[#57544E]">
                <span>Fig 01. The Writer&apos;s Desk &amp; Broadsheet</span>
                <span>Plate I — Est. 2026</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
