"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ViewTracker({ blogId }) {
useEffect(() => {
  console.log("ViewTracker mounted");
  const key = `viewed-${blogId}`;

  if (sessionStorage.getItem(key)) return;

  const trackView = async () => {
    try {
      const res = await fetch(`${API_URL}/blogs/${blogId}/view`, {
        method: "POST",
      });

      if (res.ok) {
        sessionStorage.setItem(key, "true");
      }
    } catch (err) {
      console.error(err);
    }
  };

  trackView();
}, [blogId]);

  return null;
}
