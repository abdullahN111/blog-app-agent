import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiPlus } from "react-icons/fi";
import LikedBlogsTable from "../../components/LikedBlogsTable";
import PublishedBlogsTable from "../../components/PublishedBlogsTable";
import SessionExpired from "../../components/SessionExpired";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#FAF8F5]">
        <div className="bg-[#FFFFFF] border border-[#111110] shadow-[6px_6px_0px_#111110] p-12 text-center max-w-lg">
          <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
            Authentication Required
          </span>
          <h1 className="font-editorial text-4xl font-bold text-[#111110] mt-2">
            You&apos;re not signed in
          </h1>
          <p className="text-[#57544E] text-sm mt-3 leading-relaxed">
            Sign in with your Google account to access your saved reading list and editorial desk.
          </p>
        </div>
      </main>
    );
  }

  async function fetchWithAuth(url, token) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return {
        unauthorized: true,
        data: null,
      };
    }

    if (!res.ok) {
      console.error(`API request failed: ${url}`, res.status);
      return {
        unauthorized: false,
        data: null,
      };
    }

    return {
      unauthorized: false,
      data: await res.json(),
    };
  }

  const myBlogsResult = await fetchWithAuth(
    `${API_URL}/my-blogs`,
    session.id_token,
  );

  const likedBlogsResult = await fetchWithAuth(
    `${API_URL}/liked-blogs`,
    session.id_token,
  );

  if (myBlogsResult.unauthorized || likedBlogsResult.unauthorized) {
    return <SessionExpired />;
  }

  const isAdmin =
    session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    session.user.email === process.env.NEXT_PUBLIC_MOD_EMAIL;

  const myBlogs = myBlogsResult.data || [];
  const publishedBlogs = await fetch(`${API_URL}/blogs`, {
    cache: "no-store",
  });
  const likedBlogs = likedBlogsResult.data || [];

  const publishedBlogData = await publishedBlogs.json();
  const totalPublishedBlogs = publishedBlogData.length;

  return (
    <main className="bg-[#FAF8F5] min-h-screen py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Editorial Profile Masthead */}
        <section className="border border-[#111110] bg-[#FFFFFF]">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  width={96}
                  height={96}
                  className="border border-[#111110] object-cover"
                />
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-[#111110] text-[#FAF8F5] text-[11px] font-mono-meta uppercase tracking-[0.14em]">
                    {isAdmin ? "Managing Editor" : "Subscriber"}
                  </span>
                  <span className="px-2.5 py-0.5 border border-[#E4DFD7] bg-[#FAF8F5] text-[#57544E] text-[11px] font-mono-meta uppercase tracking-[0.14em]">
                    Active Credentials
                  </span>
                </div>

                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#111110]">
                  {session.user.name}
                </h1>

                <div className="flex items-center gap-2 mt-1.5 text-xs font-mono-meta text-[#57544E]">
                  <FiMail size={13} />
                  <span>{session.user.email}</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link
                href="/create-blog"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-[0.14em] font-medium hover:bg-[#C83E2B] transition-colors"
              >
                <FiPlus size={15} />
                <span>Commission New Dispatch</span>
              </Link>
            )}
          </div>

          {/* Architectural Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#111110] divide-y sm:divide-y-0 sm:divide-x divide-[#E4DFD7] bg-[#F3EFEA]">
            <div className="p-6">
              <p className="text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
                Endorsed Dispatches
              </p>
              <p className="font-editorial text-4xl font-bold text-[#111110] mt-1">
                {likedBlogs.length}
              </p>
            </div>

            {isAdmin ? (
              <div className="p-6">
                <p className="text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
                  Live Publication Index
                </p>
                <p className="font-editorial text-4xl font-bold text-[#111110] mt-1">
                  {totalPublishedBlogs}
                </p>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
                  Membership Tier
                </p>
                <p className="font-editorial text-2xl font-bold text-[#111110] mt-2">
                  Reader Edition
                </p>
              </div>
            )}

            <div className="p-6">
              <p className="text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#57544E]">
                Desk Status
              </p>
              <p className="font-editorial text-2xl font-bold text-[#2A6F4E] mt-2">
                Verified &amp; Active
              </p>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-6 border-b border-[#111110] gap-2">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                  Author Ledger
                </span>
                <h2 className="font-editorial text-3xl font-bold text-[#111110] mt-1">
                  Your Commissioned Dispatches
                </h2>
              </div>
              <p className="text-xs font-mono-meta text-[#57544E]">
                Manage visibility, revisions, and archival status.
              </p>
            </div>

            {myBlogs.length ? (
              <PublishedBlogsTable blogs={myBlogs} />
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E4DFD7] p-16 text-center">
                <h3 className="font-editorial text-2xl font-bold text-[#111110]">
                  No dispatches commissioned yet
                </h3>
                <p className="text-xs font-mono-meta uppercase tracking-wider text-[#85817A] mt-2">
                  Use the Create Blog studio to generate your first essay.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-6 border-b border-[#111110] gap-2">
            <div>
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                Personal Anthology
              </span>
              <h2 className="font-editorial text-3xl font-bold text-[#111110] mt-1">
                Endorsed Reading List
              </h2>
            </div>
            <p className="text-xs font-mono-meta text-[#57544E]">
              Essays you have endorsed and saved for reference.
            </p>
          </div>

          {likedBlogs.length ? (
            <LikedBlogsTable blogs={likedBlogs} />
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E4DFD7] p-16 text-center">
              <h3 className="font-editorial text-2xl font-bold text-[#111110]">
                Your reading list is empty
              </h3>
              <p className="text-xs font-mono-meta uppercase tracking-wider text-[#85817A] mt-2">
                Endorse essays across the archive to save them here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
