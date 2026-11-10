"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { authFetch } from "../utils/authFetch";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CommentForm({ blogId }) {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify({
          blog_id: Number(blogId),
          text: text.trim(),
        }),
        credentials: "include",
      });

      if (!res) return;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${res.status}`,
        );
      }

      setText("");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to post comment");
      console.error("Comment submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Contribute a considered response to this dispatch..."
        className="w-full p-4 bg-[#FAF8F5] border border-[#111110] text-sm text-[#111110] placeholder:text-[#85817A] focus:outline-none focus:border-[#C83E2B] resize-none"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#C83E2B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish Response"}
        </button>
      </div>
    </form>
  );
}
