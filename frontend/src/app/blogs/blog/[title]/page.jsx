import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiHeart, FiEye } from "react-icons/fi";
import BlogGrid from "../../../../components/BlogGrid";
import CommentForm from "../../../../components/CommentForm";
import CommentList from "../../../../components/CommentList";
import LikeButton from "../../../../components/LikeButton";
import ViewTracker from "../../../../components/ViewTracker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getBlog(slug) {
  const res = await fetch(`${API_URL}/blogs/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getRelatedBlogs(category, excludeId) {
  const res = await fetch(`${API_URL}/blogs/category/${category}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const blogs = await res.json();
  return blogs.filter((b) => b.id !== excludeId).slice(0, 3);
}

async function getComments(blogId) {
  const res = await fetch(`${API_URL}/blogs/${blogId}/comments`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BlogPage({ params }) {
  const { title } = await params;
  const blog = await getBlog(title);

  if (!blog) return notFound();

  const relatedBlogs = await getRelatedBlogs(blog.category, blog.id);
  const comments = await getComments(blog.id);

  const firstPart = blog.introContent;
  const secondPart = blog.content;

  return (
    <article className="min-h-screen bg-[#FAF8F5] py-10 md:py-16">
      <ViewTracker blogId={blog.id} />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-[820px] mx-auto">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#111110]">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-xs font-mono-meta uppercase tracking-[0.14em] text-[#57544E] hover:text-[#111110] transition-colors"
            >
              <FiArrowLeft size={14} />
              <span>Back to Archive</span>
            </Link>

            <Link
              href={`/blogs/category/${blog.category}`}
              className="px-2.5 py-1 bg-[#F3EFEA] border border-[#111110] text-[11px] font-mono-meta uppercase tracking-[0.14em] text-[#C83E2B] font-medium"
            >
              {blog.category}
            </Link>
          </div>

          <header className="mb-10">
            <h1 className="font-editorial text-3xl sm:text-5xl md:text-[54px] font-bold text-[#111110] leading-[1.1] tracking-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#E4DFD7] text-xs font-mono-meta uppercase tracking-wider text-[#57544E]">
              <time dateTime={blog.created_at}>
                Published{" "}
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-1.5">
                  <FiHeart className="text-[#C83E2B]" size={14} />
                  {blog.likes} Endorsements
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiEye className="text-[#57544E]" size={14} />
                  {blog.views} Reads
                </span>
              </div>
            </div>

            <figure className="mt-8 border border-[#111110] bg-[#FFFFFF] p-2">
              <div className="relative h-72 sm:h-[440px] w-full overflow-hidden bg-[#F3EFEA]">
                <Image
                  src={
                    blog.primary_image.startsWith("http")
                      ? blog.primary_image
                      : `${API_URL}/${blog.primary_image.replace(/\\/g, "/")}`
                  }
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
          </header>

          {/* Editorial Body Column */}
          <div className="bg-[#FFFFFF] border border-[#E4DFD7] p-6 sm:p-10 md:p-14">
            <div className="max-w-[68ch] mx-auto text-[#111110] leading-[1.85] whitespace-pre-line">
              {blog.introContentHeading && (
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#111110] mb-4 leading-snug">
                  {blog.introContentHeading}
                </h2>
              )}

              <p className="text-[17px] sm:text-[19px] text-[#262522] font-editorial leading-[1.8]">
                {firstPart}
              </p>

              {blog.secondary_image && (
                <figure className="my-10 border border-[#E4DFD7] bg-[#FAF8F5] p-2">
                  <Image
                    src={
                      blog.secondary_image.startsWith("http")
                        ? blog.secondary_image
                        : `${API_URL}/${blog.secondary_image.replace(/\\/g, "/")}`
                    }
                    alt={`${blog.title} - Visual Plate`}
                    width={825}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                </figure>
              )}

              {blog.contentHeading && (
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#111110] mt-10 mb-4 leading-snug">
                  {blog.contentHeading}
                </h3>
              )}

              <p className="text-base sm:text-[17px] text-[#262522] leading-[1.85]">
                {secondPart}
              </p>

              <div className="mt-12 pt-8 border-t border-[#111110] flex items-center justify-between">
                <span className="font-mono-meta text-xs uppercase tracking-wider text-[#57544E]">
                  End of Dispatch
                </span>
                <LikeButton blogId={blog.id} />
              </div>
            </div>
          </div>

          {/* Reader Correspondence / Comments */}
          <section className="mt-12 bg-[#FFFFFF] border border-[#111110] p-6 sm:p-10">
            <div className="pb-4 mb-6 border-b border-[#E4DFD7] flex items-baseline justify-between">
              <h3 className="font-editorial text-2xl font-bold text-[#111110]">
                Reader Correspondence
              </h3>
              <span className="font-mono-meta text-xs uppercase tracking-wider text-[#57544E]">
                {comments.length} {comments.length === 1 ? "Response" : "Responses"}
              </span>
            </div>

            <CommentForm blogId={blog.id} />
            <CommentList comments={comments} />
          </section>
        </div>

        {relatedBlogs.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#111110]">
            <div className="mb-8">
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                Further Reading
              </span>
              <h2 className="font-editorial text-3xl font-bold text-[#111110] mt-1">
                Related Dispatches
              </h2>
            </div>
            <BlogGrid blogs={relatedBlogs} />
          </section>
        )}
      </div>
    </article>
  );
}
