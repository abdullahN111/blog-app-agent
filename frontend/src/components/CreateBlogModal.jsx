"use client";

import Link from "next/link";
import { FiX, FiYoutube, FiCpu } from "react-icons/fi";

export default function CreateBlogModal({ open, onClose, loggedIn }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
        >
          <FiX size={22} />
        </button>

        <div className="w-14 h-14 rounded-xl bg-middle text-white flex items-center justify-center mb-5">
          <FiCpu size={28} />
        </div>

        <h2 className="text-2xl font-bold text-primary mb-3">
          AI Blog Generator
        </h2>

        {!loggedIn ? (
          <>
            <p className="text-gray-600 leading-7">
              Please sign in first to explore this feature.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 leading-7">
              This project includes an AI-powered blog generator that creates
              complete blog posts from a topic and your perspective.
            </p>

            <p className="text-gray-600 mt-4 leading-7">
              Since it relies on paid AI APIs, public access is disabled to
              prevent unnecessary API usage.
            </p>

            <p className="text-gray-600 mt-4">
              I apologize for the limitation. You can watch a complete demo of
              this feature below.
            </p>

            <Link
              href="https://www.youtube.com/watch?v=Xn-8I7QdmN8"
              target="_blank"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-white font-medium hover:bg-red-700 transition"
            >
              <FiYoutube size={20} />
              Watch Demo
            </Link>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border py-3 hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
