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

      toast.success("Blog unpublished successfully.");
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

      toast.success("Blog published successfully.");
      setBlogList((currentBlogs) =>
        currentBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, published: true } : blog,
        ),
      );
    } catch (error) {
      console.error("Publish error:", error);
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
      <div className="border border-[#E4DFD7] bg-[#FFFFFF] p-12 text-center">
        <h3 className="font-editorial text-2xl font-bold text-[#111110]">
          No commissioned dispatches
        </h3>
        <p className="mt-2 text-xs font-mono-meta uppercase tracking-wider text-[#85817A]">
          Your published manuscripts will appear here.
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
                Manuscript &amp; Desk
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Lead Excerpt
              </th>

              <th className="w-[160px] px-6 py-4 text-center text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Metrics
              </th>

              <th className="w-[210px] px-6 py-4 text-center text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#111110]">
                Controls
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E4DFD7]">
            {blogList.map((blog) => {
              const slug = blog.slug || generateSlug(blog.title);

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

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex border border-[#E4DFD7] bg-[#F3EFEA] px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider text-[#C83E2B]">
                            {blog.category}
                          </span>
                          <span
                            className={`inline-flex px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider ${
                              blog.published
                                ? "bg-[#2A6F4E]/10 text-[#2A6F4E]"
                                : "bg-[#85817A]/15 text-[#57544E]"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft / Archived"}
                          </span>
                        </div>
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
                        <FiHeart className="text-[#C83E2B] size-3.5" />
                        <span>{blog.likes}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#57544E]">
                        <FiEye className="size-3.5" />
                        <span>{blog.views}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <Link
                        href={`/blogs/blog/${slug}`}
                        title="View Essay"
                        className="border border-[#E4DFD7] bg-[#FAF8F5] p-2.5 text-[#111110] transition hover:border-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5]"
                      >
                        <FiEye size={15} />
                      </Link>

                      <button
                        title="Edit Manuscript"
                        onClick={() =>
                          router.push(`/account/edit-blog/${blog.id}`)
                        }
                        className="border border-[#E4DFD7] bg-[#FAF8F5] p-2.5 text-[#111110] transition hover:border-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5] cursor-pointer"
                      >
                        <FiEdit2 size={15} />
                      </button>

                      {blog.published ? (
                        <button
                          title="Unpublish"
                          onClick={() => handleUnpublish(blog.id)}
                          disabled={loadingId === blog.id}
                          className="border border-[#E4DFD7] bg-[#FAF8F5] p-2.5 text-[#111110] transition hover:border-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5] disabled:opacity-50 cursor-pointer"
                        >
                          <FiArchive size={15} />
                        </button>
                      ) : (
                        <button
                          title="Publish"
                          onClick={() => handlePublish(blog.id)}
                          disabled={loadingId === blog.id}
                          className="border border-[#E4DFD7] bg-[#FAF8F5] p-2.5 text-[#2A6F4E] transition hover:border-[#2A6F4E] hover:bg-[#2A6F4E] hover:text-[#FAF8F5] disabled:opacity-50 cursor-pointer"
                        >
                          <FiCheck size={15} />
                        </button>
                      )}

                      <button
                        title="Delete"
                        onClick={() => setDeleteBlogId(blog.id)}
                        disabled={loadingId === blog.id}
                        className="border border-[#E4DFD7] bg-[#FAF8F5] p-2.5 text-[#C83E2B] transition hover:border-[#C83E2B] hover:bg-[#C83E2B] hover:text-[#FAF8F5] disabled:opacity-50 cursor-pointer"
                      >
                        <FiTrash2 size={15} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111110]/60 px-4">
          <div className="w-full max-w-md border border-[#111110] bg-[#FAF8F5] p-7 shadow-[8px_8px_0px_#111110]">
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
              Permanent Deletion
            </span>
            <h3 className="font-editorial text-2xl font-bold text-[#111110] mt-1">
              Delete this manuscript?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#57544E]">
              This action is irreversible. The essay and its hosted photographic plates will be permanently purged.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteBlogId(null)}
                disabled={loadingId === deleteBlogId}
                className="border border-[#111110] bg-transparent px-4 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteBlogId)}
                disabled={loadingId === deleteBlogId}
                className="bg-[#C83E2B] px-4 py-2 text-xs font-mono-meta uppercase tracking-wider text-[#FAF8F5] hover:bg-[#A63020] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {loadingId === deleteBlogId ? "Purging..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
