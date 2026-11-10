import BlogGrid from "../../../../components/BlogGrid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getBlogsByCategory(category) {
  const res = await fetch(`${API_URL}/blogs/category/${category}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const filteredBlogs = await getBlogsByCategory(category);

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-[#111110] gap-4">
        <div>
          <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
            Section Archive
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#111110] capitalize mt-1">
            {category.replace(/-/g, " ")}
          </h2>
        </div>
        <p className="text-xs font-mono-meta uppercase tracking-wider text-[#57544E]">
          {filteredBlogs.length} {filteredBlogs.length === 1 ? "Entry" : "Entries"}
        </p>
      </div>
      <BlogGrid blogs={filteredBlogs} />
    </section>
  );
}
