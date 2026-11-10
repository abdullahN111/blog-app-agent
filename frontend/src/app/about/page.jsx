"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const pillars = [
  {
    num: "01",
    title: "Thesis-Driven AI Synthesis",
    body: "Unlike generic prompt wrappers, Blogout requires an explicit human perspective before the Gemini 2.5 Flash editorial agent drafts a single sentence.",
  },
  {
    num: "02",
    title: "Structured Editorial Taxonomy",
    body: "Every essay is indexed by subject desk, canonical slug, and reading signal—making long-form archives effortless to browse and reference.",
  },
  {
    num: "03",
    title: "Dual-Plate Visual Journalism",
    body: "Articles pair lead and in-essay photographic plates hosted on Cloudinary with high-contrast serif typography and a 68-character reading measure.",
  },
  {
    num: "04",
    title: "Reader Endorsements & Letters",
    body: "Authenticated readers can endorse dispatches into their personal anthology and contribute considered responses at the foot of every essay.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#FAF8F5]">
      <section className="border-b border-[#111110]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-block font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B] mb-3">
              Masthead &amp; Editorial Charter
            </span>

            <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#111110] leading-[1.08] tracking-tight">
              Human perspective at the center. Autonomous agents on the desk.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#57544E] leading-relaxed">
              Blogout transforms raw thesis statements and field notes into complete, structured essays. Provide a working title and your distinct viewpoint; our editorial agent composes a cohesive lead and deep-dive analysis ready for publication.
            </p>

            <div className="mt-8">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 bg-[#111110] text-[#FAF8F5] px-6 py-3.5 text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#C83E2B] transition-colors"
              >
                <span>Browse The Archive</span>
                <FiArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#111110] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="mb-12 pb-6 border-b border-[#111110] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                Architecture of a Dispatch
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#111110] mt-1">
                What sets Blogout apart
              </h2>
            </div>
            <p className="text-xs font-mono-meta uppercase tracking-wider text-[#57544E]">
              Four Editorial Pillars
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 border border-[#111110] divide-y md:divide-y-0 md:divide-x divide-[#E4DFD7]">
            {pillars.map((p) => (
              <div key={p.num} className="p-8 bg-[#FAF8F5] flex flex-col">
                <span className="font-mono-meta text-xs text-[#C83E2B] font-medium mb-6">
                  /{p.num}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#111110] mb-3 leading-snug">
                  {p.title}
                </h3>
                <p className="text-sm text-[#57544E] leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border border-[#111110] bg-[#F3EFEA] p-8 sm:p-12">
          <div className="lg:col-span-8 space-y-4">
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
              Editorial Statement
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#111110]">
              Built for writers who value substance over boilerplate.
            </h2>
            <p className="text-[#57544E] text-base leading-relaxed max-w-2xl">
              We believe every writer has observations worth publishing. By pairing your conviction with structured agentic drafting, Blogout eliminates blank-page friction while preserving editorial voice.
            </p>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 bg-[#111110] text-[#FAF8F5] px-7 py-4 text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#C83E2B] transition-colors"
            >
              <span>Enter Archive</span>
              <FiArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
