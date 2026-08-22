"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { FiTrash2 } from "react-icons/fi";
import { authFetch } from "../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CommentList({ comments }) {
  const { data: session } = useSession();

  async function deleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await authFetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });
      if (!res) return;

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  }

  if (!comments.length) {
    return (
      <div className="py-12 text-center border border-dashed rounded-xl bg-gray-50">
        <p className="text-gray-500">No comments yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Be the first to start the discussion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((c) => (
        <div
          key={c.id}
          className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          {c.user_image ? (
            <Image
              src={c.user_image}
              alt={c.user_name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
              {c.user_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-primary">{c.user_name}</h4>

                <p className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {session?.user?.email === c.user_email && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>

            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
