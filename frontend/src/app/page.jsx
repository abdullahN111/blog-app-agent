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
    <main className="px-3 md:px-6 sm:px-8">
      <Hero />

      <div className="my-12">
        <h2 className="text-3xl font-bold text-primary text-center mb-10 capitalize">
          Our Blogs
        </h2>
        <BlogGrid blogs={blogs} />
      </div>
    </main>
  );
}
