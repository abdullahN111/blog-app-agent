import Image from "next/image";
import BlogCard from "./BlogCard";

export default function BlogGrid({ blogs }) {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="border border-[#111110] bg-[#FFFFFF] p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="max-w-md mx-auto mb-6 border border-[#E4DFD7] bg-[#FAF8F5] p-2">
          <Image
            src="/assets/editorial-archive.jpg"
            alt="Empty Archive Shelf"
            width={640}
            height={360}
            className="w-full h-auto object-cover"
          />
        </div>
        <p className="font-editorial text-2xl font-bold text-[#111110]">
          No dispatches filed in this section yet.
        </p>
        <p className="text-xs font-mono-meta uppercase tracking-wider text-[#85817A] mt-2">
          Check back soon or explore another section desk above
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
