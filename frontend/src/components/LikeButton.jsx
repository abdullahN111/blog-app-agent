"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { authFetch } from "../utils/authFetch";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LikeButton({ blogId }) {
  const { data: session } = useSession();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!session) return;

    async function loadLiked() {
      const res = await authFetch(`${API_URL}/liked-blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });
      if (!res) return;

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    }

    loadLiked();
  }, [session, blogId]);

  async function handleLike() {
    if (!session) {
      toast.error("Please login first.");
      return;
    }

    try {
      const res = await authFetch(`${API_URL}/liked-blogs/${blogId}`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      if (!res) return;

      if (res.ok) {
        setLiked(!liked);
      }
    } catch (err) {
      toast.error(err.message || "Failed to like blog");
      console.error("Like submission error:", err);
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`inline-flex items-center gap-2.5 px-4 py-2 border text-xs font-mono-meta uppercase tracking-wider transition-colors cursor-pointer ${
        liked
          ? "border-[#C83E2B] bg-[#C83E2B] text-[#FAF8F5]"
          : "border-[#111110] bg-[#FAF8F5] text-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5]"
      }`}
    >
      {liked ? <FaHeart size={14} /> : <FiHeart size={14} />}
      <span>{liked ? "Endorsed" : "Endorse Essay"}</span>
    </button>
  );
}
