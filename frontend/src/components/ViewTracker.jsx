"use client";

import { useEffect } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ViewTracker({ blogId }) {
  useEffect(() => {
    const key = `viewed-${blogId}`;

    if (sessionStorage.getItem(key)) return;

    const trackView = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${blogId}/view`, {
          method: "POST",
        });

        if (!res.ok) {
          console.error("Failed to record view");
          return;
        }

        localStorage.setItem(key, "true");
        
      } catch (err) {
        console.error("View tracking failed:", err);
      }
    };

    trackView();
  }, [blogId]);

  return null;
}