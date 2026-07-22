"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ViewTracker({ blogId }) {
  useEffect(() => {
    const key = `viewed-${blogId}`;

    if (sessionStorage.getItem(key)) return;

    fetch(`${API_URL}/blogs/${blogId}/view`, {
      method: "POST",
    });

    sessionStorage.setItem(key, "true");
  }, [blogId]);

  return null;
}
