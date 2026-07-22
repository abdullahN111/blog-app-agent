"use client";

import Link from "next/link";
import {
  FiBookOpen,
  FiCpu,
  FiImage,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <span className="bg-higher text-middle px-4 py-2 rounded-full text-sm font-medium">
            About Blogout
          </span>

          <h1 className="text-5xl font-bold text-primary mt-6 leading-tight">
            AI-powered blogging for modern content creators.
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            Blogout helps you transform ideas into complete, engaging blog
            articles in minutes. Simply provide a topic and your perspective,
            and our AI generates structured, readable content while allowing you
            to organize everything into categories and manage your growing
            collection of blogs.
          </p>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 bg-middle text-white px-6 py-3 rounded-lg mt-8 hover:bg-[#f31e65ef] transition"
          >
            Explore Blogs
            <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary">
              What makes Blogout different?
            </h2>

            <p className="text-gray-600 mt-3">
              Everything you need to create and discover quality AI-assisted
              blogs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border">
              <FiCpu className="text-middle text-4xl mb-5" />
              <h3 className="font-semibold text-xl mb-3">
                AI Generated Content
              </h3>
              <p className="text-gray-600">
                Generate complete blog articles from just a topic and your
                personal perspective.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border">
              <FiBookOpen className="text-middle text-4xl mb-5" />
              <h3 className="font-semibold text-xl mb-3">
                Organized Categories
              </h3>
              <p className="text-gray-600">
                Browse blogs by category to quickly find content that interests
                you.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border">
              <FiImage className="text-middle text-4xl mb-5" />
              <h3 className="font-semibold text-xl mb-3">
                Rich Visual Content
              </h3>
              <p className="text-gray-600">
                Support every article with beautiful images for a more engaging
                reading experience.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border">
              <FiUsers className="text-middle text-4xl mb-5" />
              <h3 className="font-semibold text-xl mb-3">Community Features</h3>
              <p className="text-gray-600">
                Like blogs, leave comments, and interact with content created by
                others.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary">Our Mission</h2>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            We believe that everyone has valuable ideas worth sharing. Blogout
            combines artificial intelligence with human creativity, helping
            writers spend less time formatting content and more time expressing
            meaningful perspectives.
          </p>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to explore amazing blogs?
          </h2>

          <p className="text-gray-300 mt-5 text-lg">
            Discover AI-generated articles across multiple categories or create
            your own if you're an administrator.
          </p>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 mt-8 bg-middle text-white px-7 py-3 rounded-lg hover:bg-[#f31e65ef] transition"
          >
            Browse Blogs
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
