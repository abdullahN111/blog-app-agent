"use client";

import { signIn } from "next-auth/react";

export default function SessionExpired() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-lg border">
        <h1 className="text-3xl font-bold text-primary">
          Your session has expired
        </h1>

        <p className="text-gray-500 mt-4">
          Please sign in again to access your account.
        </p>

        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/account",
            })
          }
          className="mt-6 px-6 py-3 rounded-lg bg-middle text-white"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}