"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SessionExpired() {
  useEffect(() => {
    signOut({
      callbackUrl: "/auth/signin?error=SessionExpired",
    });
  }, []);

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary">
          Your session has expired
        </h1>

        <p className="text-gray-500 mt-2">
          Signing you out...
        </p>
      </div>
    </main>
  );
}