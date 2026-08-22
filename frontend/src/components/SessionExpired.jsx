"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SessionExpired() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "BackendAuthError") {
      signIn("google");
    }
  }, [session]);

  return null;
}