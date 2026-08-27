"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FiEye,
  FiHeart,
  FiEdit2,
  FiTrash2,
  FiArchive,
  FiCheck,
} from "react-icons/fi";
import { generateSlug } from "../utils/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PublishedBlogsTable({ blogs }) {
  const [blogList, setBlogList] = useState(blogs);
  const [loadingId, setLoadingId] = useState(null);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleUnpublish = async (blogId) => {
    if (!session?.id_token) {
      toast.error("Please login again.");
      return;
    }

    try {
      setLoadingId(blogId);

      const response = await fetch(`${API_URL}/blogs/${blogId}/unpublish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to unpublish blog");
      }

      setBlogList((currentBlogs) =>
        currentBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, published: false } : blog,
        ),
      );
    } catch (error) {
      console.error("Unpublish error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePublish = async (blogId) => {
    if (!session?.id_token) {
      toast.error("Please login again.");
      return;
    }

    try {
      setLoadingId(blogId);

      const response = await fetch(`${API_URL}/blogs/${blogId}/publish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to publish blog");
      }

      setBlogList((currentBlogs) =>
        currentBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, published: true } : blog,
        ),
      );
    } catch (error) {
      console.error("Publish error:", error);
      // alert(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (blogId) => {
    if (!session?.id_token) {
      toast.error("Please login again.");
      return;
    }

    try {
      setLoadingId(blogId);

      const response = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete blog");
      }

      setBlogList((currentBlogs) =>
        currentBlogs.filter((blog) => blog.id !== blogId),
      );

      toast.success("Blog deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete blog.");
    } finally {
      setLoadingId(null);
      setDeleteBlogId(null);
    }
  };

  if (!blogList.length) {
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
            {blogList.map((blog) => {
              const slug = generateSlug(blog.title);

              return (
                <tr
                  key={blog.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-7 py-6">
                    <div className="flex items-center gap-5">
                      <Image
                        src={
                          blog.primary_image.startsWith("http")
                            ? blog.primary_image
                            : `${API_URL}/${blog.primary_image.replace(/\\/g, "/")}`
                        }
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
                        <FiHeart className="text-red-500 size-4" />
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
                        onClick={() =>
                          router.push(`/account/edit-blog/${blog.id}`)
                        }
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-blue-600 hover:text-white"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {blog.published ? (
                        <button
                          title="Unpublish"
                          onClick={() => handleUnpublish(blog.id)}
                          disabled={loadingId === blog.id}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-amber-500 hover:text-white disabled:opacity-50"
                        >
                          <FiArchive size={16} />
                        </button>
                      ) : (
                        <button
                          title="Publish"
                          onClick={() => handlePublish(blog.id)}
                          disabled={loadingId === blog.id}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-green-600 hover:text-white disabled:opacity-50"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}

                      <button
                        title="Delete"
                        onClick={() => setDeleteBlogId(blog.id)}
                        disabled={loadingId === blog.id}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
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
      {deleteBlogId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">
              Delete this blog?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone. The blog and its associated images
              will be permanently deleted.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteBlogId(null)}
                disabled={loadingId === deleteBlogId}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteBlogId)}
                disabled={loadingId === deleteBlogId}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingId === deleteBlogId ? "Deleting..." : "Delete Blog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
