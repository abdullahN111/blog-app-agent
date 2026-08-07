"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { generateSlug } from "../utils/utils";
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

    setLikedBlogs((prev) =>
      prev.filter((blog) => blog.id !== blogId)
    );
  } catch (err) {
    console.error(err);
  }
};
  
  if (!likedBlogs.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">
          No liked blogs yet.
        </h3>

        <p className="mt-2 text-slate-500">Like blogs to see them here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full table-fixed">
          <thead className="bg-slate-900">
            <tr>
              <th className="w-[360px] px-7 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-300">
                Blog
              </th>

              <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-300">
                Description
              </th>

              <th className="w-[170px] px-7 py-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-300">
                Stats
              </th>

              <th className="w-[220px] px-7 py-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {likedBlogs.map((blog) => {
              const slug = generateSlug(blog.title);

              return (
                <tr
                  key={blog.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-7 py-6">
                    <div className="flex items-center gap-5">
                      <Image
                        src={`${API_URL}/${blog.primary_image.replace(
                          /\\/g,
                          "/",
                        )}`}
                        alt={blog.title}
                        width={120}
                        height={78}
                        className="h-[78px] w-[120px] rounded-lg border border-slate-200 object-cover shadow-sm"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-lg font-semibold leading-6 text-slate-900">
                          {blog.title}
                        </h4>

                        <span className="mt-3 inline-flex rounded-md border border-middle-200 bg-middle/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-middle">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-7 py-6 align-top">
                    <p className="line-clamp-3 break-words text-[15px] leading-7 text-slate-600">
                      {blog.introContent}
                    </p>
                  </td>

                  <td className="px-7 py-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-base text-slate-700">
                        <FaHeart className="text-red-500 size-4" />
                        <span className="font-semibold">{blog.likes}</span>
                      </div>

                      <div className="flex items-center gap-2 text-base text-slate-700">
                        <FiEye className="text-slate-500 size-4" />
                        <span className="font-semibold">{blog.views}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-7 py-6">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/blogs/blog/${slug}`}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-primary hover:text-primary"
                      >
                        View
                      </Link>

                      <button
  onClick={() => removeLiked(blog.id)}
  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 cursor-pointer"
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
