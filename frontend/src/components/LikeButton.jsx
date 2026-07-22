"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LikeButton({ blogId }) {
  const { data: session } = useSession();

  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    async function loadLiked() {
      const res = await fetch(`${API_URL}/liked-blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    }

    loadLiked();
  }, [session, blogId]);

  async function handleLike() {
    if (!session) {
      setError("Please login first.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/liked-blogs/${blogId}`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });

      if (res.ok) {
        setLiked(!liked);
      }
    } catch (err) {
      setError(err.message || "Failed to like blog");
      console.error("Like submission error:", err);
    }
  }

  return (
    <button
      onClick={handleLike}
      className="mt-6 flex items-center gap-2 text-gray-600 transition cursor-pointer"
    >
      {liked ? (
        <FaHeart className="text-red-500 size-8" />
      ) : (
        <FiHeart className="size-8" />
      )}

      <span className="text-xl">
        {liked ? "Liked" : "Like"}
      </span>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </button>
  );
}