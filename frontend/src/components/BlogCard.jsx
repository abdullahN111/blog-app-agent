"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiHeart, FiEye } from "react-icons/fi";
import { generateSlug } from "../utils/utils";

export default function BlogCard({ blog }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <article className="group flex flex-col bg-[#FFFFFF] border border-[#E4DFD7] hover:border-[#111110] transition-colors duration-200">
      <div className="px-5 py-3 border-b border-[#E4DFD7] flex items-center justify-between text-[11px] font-mono-meta uppercase tracking-[0.12em] text-[#57544E]">
        <Link
          href={`/blogs/category/${generateSlug(blog.category)}`}
          className="text-[#C83E2B] font-medium hover:underline"
        >
          {blog.category}
        </Link>
        <time dateTime={blog.created_at}>
          {new Date(blog.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>

      <Link
        href={`/blogs/blog/${blog.slug}`}
        className="relative h-56 w-full overflow-hidden border-b border-[#E4DFD7] bg-[#F3EFEA] block"
      >
        <Image
          src={
            blog.primary_image.startsWith("http")
              ? blog.primary_image
              : `${API_URL}/${blog.primary_image.replace(/\\/g, "/")}`
          }
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </Link>

      <div className="flex flex-col grow p-6">
        <Link href={`/blogs/blog/${blog.slug}`}>
          <h3 className="font-editorial text-2xl font-bold text-[#111110] mb-2.5 leading-snug line-clamp-2 group-hover:text-[#C83E2B] transition-colors">
            {blog.title}
          </h3>
        </Link>

        <p className="text-[#57544E] mb-6 line-clamp-3 leading-relaxed text-sm">
          {blog.introContent}
        </p>

        <div className="mt-auto pt-4 border-t border-[#E4DFD7] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-mono-meta text-[#57544E]">
            <span className="inline-flex items-center gap-1.5">
              <FiHeart className="text-[#C83E2B]" size={13} />
              {blog.likes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiEye className="text-[#57544E]" size={13} />
              {blog.views}
            </span>
          </div>

          <Link
            href={`/blogs/blog/${blog.slug}`}
            className="inline-flex items-center gap-1 text-xs font-mono-meta uppercase tracking-[0.12em] font-medium text-[#111110] group-hover:text-[#C83E2B] transition-colors"
          >
            <span>Read Essay</span>
            <FiArrowUpRight
              size={15}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
