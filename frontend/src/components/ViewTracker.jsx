"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ViewTracker({ blogId }) {
useEffect(() => {
  console.log("ViewTracker mounted");

  const key = `viewed-${blogId}`;

  console.log("session key:", key);
  console.log("stored value:", sessionStorage.getItem(key));

  if (sessionStorage.getItem(key)) {
    console.log("Already viewed");
    return;
  }

  console.log("About to fetch");

  fetch(`${API_URL}/blogs/${blogId}/view`, {
    method: "POST",
  })
    .then(async (res) => {
      console.log("Response:", res.status);
      console.log(await res.text());

      if (res.ok) {
        sessionStorage.setItem(key, "true");
      }
    })
    .catch((err) => {
      console.error("Fetch failed:", err);
    });
}, [blogId]);

  return null;
}
