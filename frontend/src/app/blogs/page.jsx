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
    <main className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-[#111110] gap-4">
        <div>
          <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
            {search ? "Search Index" : "Complete Index"}
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#111110] mt-1">
            {search ? `Results for "${search}"` : "Publication Archive"}
          </h1>
        </div>

        <p className="text-xs font-mono-meta uppercase tracking-wider text-[#57544E]">
          {blogs.length} {blogs.length === 1 ? "Dispatch" : "Dispatches"} Indexed
        </p>
      </div>

      <BlogGrid blogs={blogs} />
    </main>
  );
}