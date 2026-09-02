import BlogGrid from "../../components/BlogGrid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAllBlogs(search) {
  const url = search
    ? `${API_URL}/blogs?search=${encodeURIComponent(search)}`
    : `${API_URL}/blogs`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch blogs");
    return [];
  }

  return res.json();
}

export default async function Blogs({ searchParams }) {
  const search = (await searchParams)?.search || "";
  const blogs = await getAllBlogs(search);

  return (
    <main className="px-3 md:px-6 sm:px-8">
      <div className="my-12">
        <h2 className="text-3xl font-bold text-primary text-center mb-2 capitalize">
          {search ? `Results for "${search}"` : "Our Blogs"}
        </h2>

        {search && (
          <p className="text-center text-gray-500 mb-10">
            {blogs.length} {blogs.length === 1 ? "blog" : "blogs"} found
          </p>
        )}

        {!search && <div className="mb-10" />}

        <BlogGrid blogs={blogs} />
      </div>
    </main>
  );
}