"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye, FiHeart, FiEdit2, FiTrash2, FiArchive } from "react-icons/fi";
import { generateSlug } from "../utils/utils";
import { FaHeart } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PublishedBlogsTable({ blogs }) {
  if (!blogs.length) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-primary">
          No published blogs
        </h3>

        <p className="mt-2 text-gray-500">
          Your published blogs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
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
            {blogs.map((blog) => {
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
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link
                        href={`/blogs/blog/${slug}`}
                        title="View"
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-900 hover:text-white"
                      >
                        <FiEye size={16} />
                      </Link>

                      <button
                        title="Edit"
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-blue-600 hover:text-white"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      <button
                        title="Unpublish"
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-amber-500 hover:text-white"
                      >
                        <FiArchive size={16} />
                      </button>

                      <button
                        title="Delete"
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-red-600 hover:text-white"
                      >
                        <FiTrash2 size={16} />
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
