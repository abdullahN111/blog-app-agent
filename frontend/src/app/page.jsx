import BlogGrid from "../components/BlogGrid";
import Hero from "../components/Hero";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAllBlogs() {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${API_URL}/blogs`, {
        cache: "no-store",
      });

      if (res.ok) {
        return await res.json();
      }

      console.error(
        `Failed to fetch blogs. Attempt ${attempt}: ${res.status}`
      );
    } catch (error) {
      console.error(
        `Failed to fetch blogs. Attempt ${attempt}:`,
        error
      );
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return [];
}

export default async function Home() {
  const blogs = await getAllBlogs();

  return (
    <main>
      <Hero />

      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-[#111110] gap-4">
          <div>
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
              Latest Dispatches
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#111110] mt-1">
              Recent Essays &amp; Analysis
            </h2>
          </div>
          <p className="text-xs font-mono-meta uppercase tracking-wider text-[#57544E]">
            Showing {blogs.length} {blogs.length === 1 ? "Entry" : "Entries"}
          </p>
        </div>

        <BlogGrid blogs={blogs} />
      </section>
    </main>
  );
}
