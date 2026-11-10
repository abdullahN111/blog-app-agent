import BlogCard from "./BlogCard";

export default function BlogGrid({ blogs }) {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="border border-[#E4DFD7] bg-[#FFFFFF] p-12 text-center">
        <p className="font-editorial text-xl text-[#111110]">
          No dispatches found in this section.
        </p>
        <p className="text-xs font-mono-meta uppercase tracking-wider text-[#85817A] mt-2">
          Check back soon or browse another category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
