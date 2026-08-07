import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Image from "next/image";
import {
  FiHeart,
  FiFileText,
  FiMail,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import LikedBlogsTable from "../../components/LikedBlogsTable";
import PublishedBlogsTable from "../../components/PublishedBlogsTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg border">
          <h1 className="text-4xl font-bold text-primary">
            You're not signed in
          </h1>

          <p className="text-gray-500 mt-4">
            Login with Google to manage your account and liked blogs.
          </p>
        </div>
      </main>
    );
  }
  async function getMyBlogs(token) {
    const res = await fetch(`${API_URL}/my-blogs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    return res.json();
  }

  async function getLikedBlogs(token) {
    const res = await fetch(`${API_URL}/liked-blogs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    return res.json();
  }

  const isAdmin =
    session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    session.user.email === process.env.NEXT_PUBLIC_MOD_EMAIL;

  const myBlogs = await getMyBlogs(session.id_token);
  const likedBlogs = await getLikedBlogs(session.id_token);

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary to-middle text-white shadow-xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"></div>
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/5"></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 p-10">
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-xl"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold">{session.user.name}</h1>

              <div className="flex justify-center md:justify-start items-center gap-2 mt-3 opacity-90">
                <FiMail />
                <span>{session.user.email}</span>
              </div>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-white/15 backdrop-blur px-5 py-2 rounded-full text-sm">
                  {isAdmin ? "Administrator" : "Reader"}
                </span>

                <span className="bg-white/15 backdrop-blur px-5 py-2 rounded-full text-sm">
                  Blogout Member
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-2xl shadow-lg p-7 border hover:-translate-y-1 transition">
            <FiHeart className="text-red-500 text-3xl mb-4" />

            <p className="text-gray-500">Liked Blogs</p>

            <h2 className="text-4xl font-bold mt-2 text-primary">
              {likedBlogs.length}
            </h2>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-lg p-7 border hover:-translate-y-1 transition">
              <FiFileText className="text-middle text-3xl mb-4" />

              <p className="text-gray-500">Published Blogs</p>

              <h2 className="text-4xl font-bold mt-2 text-primary">
                {myBlogs.length}
              </h2>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-7 border hover:-translate-y-1 transition">
            <FiTrendingUp className="text-green-500 text-3xl mb-4" />

            <p className="text-gray-500">Status</p>

            <h2 className="text-2xl font-semibold mt-2">Active</h2>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiHeart className="text-red-500 text-xl" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-primary">Liked Blogs</h2>

              <p className="text-gray-500">Blogs you've saved for later.</p>
            </div>
          </div>

          {likedBlogs.length ? (
            <LikedBlogsTable blogs={likedBlogs} />
          ) : (
            <div className="bg-white border rounded-3xl shadow-lg p-20 text-center">
              <FiHeart className="text-6xl text-gray-300 mx-auto mb-5" />

              <h3 className="text-2xl font-semibold text-primary">
                No liked blogs yet
              </h3>

              <p className="text-gray-500 mt-3">
                Start exploring and like articles you enjoy.
              </p>
            </div>
          )}
        </section>

        {isAdmin && (
          <section className="mt-20">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-xl bg-middle/10 flex items-center justify-center">
                <FiAward className="text-middle text-xl" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-primary">
                  Your Published Blogs
                </h2>

                <p className="text-gray-500">
                  Manage everything you've written.
                </p>
              </div>
            </div>

            {myBlogs.length ? (
              <PublishedBlogsTable blogs={myBlogs} />
            ) : (
              <div className="bg-white border rounded-3xl shadow-lg p-20 text-center">
                <FiFileText className="text-6xl text-gray-300 mx-auto mb-5" />

                <h3 className="text-2xl font-semibold text-primary">
                  No blogs published
                </h3>

                <p className="text-gray-500 mt-3">
                  Create your first article from the Create Blog page.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
