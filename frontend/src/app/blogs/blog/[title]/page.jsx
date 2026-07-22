import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiEye, FiArrowLeft, FiHeart } from "react-icons/fi";
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
  return blogs.filter((b) => b.id !== excludeId).slice(0, 2);
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
    <article className="min-h-screen bg-gray-50 py-8">
      <ViewTracker blogId={blog.id} />
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blogs"
            className="inline-flex items-center text-middle hover:text-primary mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blogs
          </Link>

          <header className="mb-8">
            <div className="relative h-80 w-full rounded-xl overflow-hidden mb-4">
              <Image
                src={`${API_URL}/${blog.primary_image.replace("\\", "/")}`}
                alt={blog.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-middle text-white text-sm font-semibold rounded-full shadow-md">
                  {blog.category}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-primary mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-gray-600">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <time dateTime={blog.created_at}>
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <FiHeart className="mr-2 text-red-500" />
                  <span>{blog.likes} Likes</span>
                </div>
                <div className="flex items-center">
                  <FiEye className="mr-2 text-green-500" />
                  <span>{blog.views} views</span>
                </div>
              </div>
            </div>
          </header>

          <div className="prose max-w-none bg-white rounded-xl p-6 md:p-8 shadow-md">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              <h2 className="text-3xl font-semibold text-primary mb-2">
                {blog.introContentHeading}
              </h2>
              <p className="text-lg">{firstPart}</p>

              {blog.secondary_image && (
                <div className="my-8 rounded-xl overflow-hidden">
                  <Image
                    src={`${API_URL}/${blog.secondary_image.replace(
                      "\\",
                      "/",
                    )}`}
                    alt={`${blog.title} - Additional content`}
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
              )}

              <h3 className="text-[28px] font-semibold text-primary my-6">
                {blog.contentHeading}
              </h3>
              <p className="text-lg">{secondPart}</p>
              <LikeButton blogId={blog.id} />
            </div>
          </div>
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">
                Comments
              </h3>

              <CommentForm blogId={blog.id} />
              <CommentList comments={comments} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Related Articles
          </h2>
          <BlogGrid blogs={relatedBlogs} />
        </div>
      </div>
    </article>
  );
}
