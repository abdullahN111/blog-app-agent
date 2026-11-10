"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LikedBlogsTable({ blogs }) {
  const { data: session } = useSession();
  const [likedBlogs, setLikedBlogs] = useState(blogs);

  const removeLiked = async (blogId) => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/liked-blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove blog");
      }

      setLikedBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!likedBlogs.length) {
    return (
      <div className="border border-[#E4DFD7] bg-[#FFFFFF] p-14 text-center">
        <h3 className="font-editorial text-2xl font-bold text-[#111110]">
          No endorsed essays remaining.
        </h3>
        <p className="mt-2 text-xs font-mono-meta uppercase tracking-wider text-[#85817A]">
          Endorse essays across the archive to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#111110] bg-[#FFFFFF]">
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full table-fixed">
          <thead className="bg-[#F3EFEA] border-b border-[#111110]">
            <tr>
              <th className="w-[380px] px-6 py-4 text-left text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Essay &amp; Section
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Lead Excerpt
              </th>

              <th className="w-[160px] px-6 py-4 text-center text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Metrics
              </th>

              <th className="w-[210px] px-6 py-4 text-center text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E4DFD7]">
            {likedBlogs.map((blog) => {
              const slug = blog.slug;

              return (
                <tr
                  key={blog.id}
                  className="transition-colors hover:bg-[#FAF8F5]"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <Image
                        src={
                          blog.primary_image.startsWith("http")
                            ? blog.primary_image
                            : `${API_URL}/${blog.primary_image.replace(/\\/g, "/")}`
                        }
                        alt={blog.title}
                        width={108}
                        height={72}
                        className="h-[72px] w-[108px] border border-[#E4DFD7] object-cover shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 font-editorial text-lg font-bold leading-snug text-[#111110]">
                          {blog.title}
                        </h4>

                        <span className="mt-2 inline-flex border border-[#E4DFD7] bg-[#F3EFEA] px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider text-[#C83E2B]">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 align-top">
                    <p className="line-clamp-3 break-words text-sm leading-relaxed text-[#57544E]">
                      {blog.introContent}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-2 font-mono-meta text-xs text-[#111110]">
                      <div className="flex items-center gap-1.5">
                        <FaHeart className="text-[#C83E2B] size-3.5" />
                        <span>{blog.likes}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#57544E]">
                        <FiEye className="size-3.5" />
                        <span>{blog.views}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/blogs/blog/${slug}`}
                        className="border border-[#111110] bg-[#FAF8F5] px-4 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#111110] transition hover:bg-[#111110] hover:text-[#FAF8F5]"
                      >
                        Read
                      </Link>

                      <button
                        onClick={() => removeLiked(blog.id)}
                        className="border border-[#C83E2B] bg-transparent px-4 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#C83E2B] transition hover:bg-[#C83E2B] hover:text-[#FAF8F5] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
