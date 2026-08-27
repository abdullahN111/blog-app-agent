"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ViewTracker({ blogId }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    
    if (status === "loading") return;


    if (!session?.id_token) return;

    const trackView = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${blogId}/view`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.id_token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to record view");
          return;
        }

        // const data = await res.json();

        // console.log("View tracking:", data);
      } catch (error) {
        console.error("View tracking failed:", error);
      }
    };

    trackView();
  }, [blogId, session, status]);

  return null;
}