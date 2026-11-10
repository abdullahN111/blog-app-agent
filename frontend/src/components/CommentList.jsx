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
      <div className="py-10 text-center border border-dashed border-[#E4DFD7] bg-[#FAF8F5]">
        <p className="font-editorial text-lg text-[#111110]">
          No reader responses on record.
        </p>
        <p className="text-xs font-mono-meta uppercase tracking-wider text-[#85817A] mt-1">
          Open the discussion above
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E4DFD7] border-t border-[#E4DFD7]">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-4 py-6">
          {c.user_image ? (
            <Image
              src={c.user_image}
              alt={c.user_name}
              width={40}
              height={40}
              className="w-10 h-10 border border-[#111110] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-[#111110] text-[#FAF8F5] flex items-center justify-center font-mono-meta text-sm shrink-0">
              {c.user_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h4 className="font-semibold text-sm text-[#111110]">
                  {c.user_name}
                </h4>
                <span className="text-[11px] font-mono-meta uppercase tracking-wider text-[#85817A]">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {session?.user?.email === c.user_email && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-[#85817A] hover:text-[#C83E2B] transition-colors cursor-pointer"
                  aria-label="Delete response"
                >
                  <FiTrash2 size={15} />
                </button>
              )}
            </div>

            <p className="mt-2 text-sm text-[#262522] leading-relaxed whitespace-pre-wrap">
              {c.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
