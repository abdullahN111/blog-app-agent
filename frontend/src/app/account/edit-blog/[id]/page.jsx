"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FiArrowLeft,
  FiCheck,
  FiLoader,
  FiSave,
  FiSliders,
  FiZap,
} from "react-icons/fi";
import { categories } from "../../../../../public/assets/blogRelatedData";
import { generateSlug } from "../../../../utils/utils";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fieldClass =
  "w-full px-4 py-3 bg-[#FAF8F5] border border-[#111110] text-sm text-[#111110] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#C83E2B] transition-colors";

const labelClass =
  "block text-xs font-mono-meta uppercase tracking-[0.12em] text-[#111110] font-medium mb-2";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState("idle");
  const [assistLoading, setAssistLoading] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [editorialFeedback, setEditorialFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    perspective: "",
    popularity: "medium",
    category: "",
    introContentHeading: "",
    introContent: "",
    contentHeading: "",
    content: "",
    primaryImage: null,
    secondaryImage: null,
  });

  const [existingImages, setExistingImages] = useState({
    primary: null,
    secondary: null,
  });

  useEffect(() => {
    if (status !== "authenticated" || !id) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/blogs/id/${id}`, {
          headers: {
            Authorization: `Bearer ${session.id_token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load blog");
        }

        const blog = await response.json();

        setFormData({
          title: blog.title || "",
          perspective: blog.perspective || "",
          popularity: blog.popularity || "medium",
          category: blog.category || "",
          introContentHeading: blog.introContentHeading || "",
          introContent: blog.introContent || "",
          contentHeading: blog.contentHeading || "",
          content: blog.content || "",
          primaryImage: null,
          secondaryImage: null,
        });

        setExistingImages({
          primary: blog.primary_image || null,
          secondary: blog.secondary_image || null,
        });
      } catch (error) {
        console.error("Error loading blog:", error);
        toast.error("Unable to load this blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [status, id, session]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRunAssist = async (action, targetField = "content") => {
    const sourceText = formData[targetField];
    if (!sourceText || sourceText.trim().length < 15) {
      toast.error("Not enough text to run AI Co-Pilot.");
      return;
    }

    setAssistLoading(action);
    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.id_token) {
        headers.Authorization = `Bearer ${session.id_token}`;
      }
      const savedKey =
        typeof window !== "undefined"
          ? window.localStorage.getItem("blogout_user_gemini_key")
          : "";
      if (savedKey) {
        headers["X-Gemini-Key"] = savedKey;
      }

      const res = await fetch(`/api/agent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          _endpoint: "assist",
          action,
          text: sourceText,
          context_title: formData.title,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "AI Co-Pilot request failed");
      }

      const { output } = await res.json();
      if (action !== "evaluate" && output.revised_text) {
        setFormData((prev) => ({
          ...prev,
          [targetField]: output.revised_text,
        }));
      }

      setEditorialFeedback({
        score: output.quality_score,
        summary: output.editorial_summary,
        headlines: output.headline_suggestions || [],
      });

      toast.success(output.editorial_summary || "Manuscript refined.");
    } catch (err) {
      toast.error(err.message || "AI Co-Pilot error");
    } finally {
      setAssistLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login first.");
      return;
    }

    setButtonState("loading");

    try {
      let primaryImage = existingImages.primary;
      let secondaryImage = existingImages.secondary;

      if (formData.primaryImage) {
        const imageFormData = new FormData();
        imageFormData.append("primary_image", formData.primaryImage);

        const uploadResponse = await fetch(`${API_URL}/upload-images`, {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Primary image upload failed");
        }

        const imagePaths = await uploadResponse.json();
        primaryImage = imagePaths.primary;
      }

      if (formData.secondaryImage) {
        const imageFormData = new FormData();
        imageFormData.append("primary_image", formData.secondaryImage);

        const uploadResponse = await fetch(`${API_URL}/upload-images`, {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Secondary image upload failed");
        }

        const imagePaths = await uploadResponse.json();
        secondaryImage = imagePaths.primary;
      }

      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          perspective: formData.perspective,
          category: formData.category,
          popularity: formData.popularity,
          introContentHeading: formData.introContentHeading,
          introContent: formData.introContent,
          contentHeading: formData.contentHeading,
          content: formData.content,
          primary_image: primaryImage,
          secondary_image: secondaryImage,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Failed to update blog");
      }

      setButtonState("success");

      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(error.message || "Something went wrong.");
      setButtonState("idle");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono-meta text-xs uppercase tracking-wider text-[#57544E]">
          <FiLoader className="animate-spin text-base text-[#C83E2B]" />
          Loading manuscript...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="border border-[#111110] bg-[#FFFFFF] p-10 text-center max-w-md">
          <h1 className="font-editorial text-3xl font-bold text-[#111110]">
            Author Authentication Required
          </h1>
          <p className="text-[#57544E] text-sm mt-2">
            Please sign in to revise your manuscripts.
          </p>
        </div>
      </div>
    );
  }

  if (!formData.title) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="border border-[#111110] bg-[#FFFFFF] p-10 text-center max-w-md">
          <h1 className="font-editorial text-3xl font-bold text-[#111110]">
            Manuscript Not Found
          </h1>
          <button
            onClick={() => router.push("/account")}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider cursor-pointer"
          >
            <FiArrowLeft />
            <span>Return to Desk</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 md:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1380px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="inline-flex items-center gap-2 text-xs font-mono-meta uppercase tracking-[0.14em] text-[#57544E] hover:text-[#111110] transition-colors cursor-pointer"
          >
            <FiArrowLeft size={14} />
            <span>Back to Editorial Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#111110] bg-[#FFFFFF] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] cursor-pointer"
          >
            <FiSliders size={14} />
            <span>{inspectorOpen ? "Hide Inspector" : "Show Inspector"}</span>
          </button>
        </div>

        <header className="pb-6 mb-8 border-b border-[#111110] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
              Manuscript Revision — ID #{id}
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#111110] mt-1">
              Edit Dispatch
            </h1>
          </div>
          <p className="text-xs font-mono-meta text-[#57544E]">
            Updating the headline automatically regenerates the canonical slug.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left / Main Canvas: Manuscript Prose & AI Co-Pilot */}
          <div
            className={`${
              inspectorOpen ? "lg:col-span-8" : "lg:col-span-12 max-w-4xl mx-auto w-full"
            } bg-[#FFFFFF] border border-[#111110] shadow-[6px_6px_0px_#111110] divide-y divide-[#E4DFD7]`}
          >
            {/* Contextual AI Co-Pilot Toolbar */}
            <div className="p-4 sm:p-5 bg-[#F3EFEA] flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#111110] font-medium flex items-center gap-1.5">
                <FiZap className="text-[#C83E2B]" />
                <span>AI Co-Pilot:</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "sharpen", label: "Sharpen Prose" },
                  { id: "expand", label: "Expand Analysis" },
                  { id: "condense", label: "Condense 25%" },
                  { id: "counter_argument", label: "+ Steelman Counter" },
                  { id: "evaluate", label: "Evaluate Quality" },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    disabled={Boolean(assistLoading)}
                    onClick={() => handleRunAssist(tool.id, "content")}
                    className="px-2.5 py-1.5 bg-[#FFFFFF] border border-[#111110] text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {assistLoading === tool.id ? "Running..." : tool.label}
                  </button>
                ))}
              </div>
            </div>

            {editorialFeedback && (
              <div className="p-5 bg-[#FAF8F5] border-b border-[#E4DFD7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-meta text-[11px] uppercase tracking-wider text-[#C83E2B] font-semibold">
                    Co-Pilot Desk Critique
                  </span>
                  <span className="px-2 py-0.5 bg-[#111110] text-[#FAF8F5] font-mono-meta text-[11px]">
                    Score: {editorialFeedback.score}/100
                  </span>
                </div>
                <p className="text-xs text-[#262522] leading-relaxed">
                  {editorialFeedback.summary}
                </p>
                {editorialFeedback.headlines?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {editorialFeedback.headlines.map((h, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, title: h }))
                        }
                        className="text-left px-2.5 py-1 bg-[#FFFFFF] border border-[#E4DFD7] hover:border-[#111110] text-xs font-editorial text-[#111110] cursor-pointer"
                      >
                        Use: &ldquo;{h}&rdquo;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manuscript Fields */}
            <div className="p-6 sm:p-10 space-y-6">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Headline <span className="text-[#C83E2B]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`${fieldClass} font-editorial text-xl font-bold`}
                />
              </div>

              <div>
                <label htmlFor="introContentHeading" className={labelClass}>
                  Introduction Subheading
                </label>
                <input
                  type="text"
                  id="introContentHeading"
                  name="introContentHeading"
                  value={formData.introContentHeading}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="introContent" className={labelClass}>
                  Lead / Introduction Paragraph
                </label>
                <textarea
                  id="introContent"
                  name="introContent"
                  rows={6}
                  value={formData.introContent}
                  onChange={handleChange}
                  className={`${fieldClass} leading-relaxed font-editorial text-base`}
                />
              </div>

              <div>
                <label htmlFor="contentHeading" className={labelClass}>
                  Main Analysis Subheading
                </label>
                <input
                  type="text"
                  id="contentHeading"
                  name="contentHeading"
                  value={formData.contentHeading}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="content" className={labelClass}>
                  Body Manuscript
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={18}
                  value={formData.content}
                  onChange={handleChange}
                  className={`${fieldClass} leading-relaxed`}
                />
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#F3EFEA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono-meta text-[#57544E]">
                Revisions take effect immediately upon saving.
              </span>

              <button
                type="submit"
                disabled={buttonState === "loading"}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-xs font-mono-meta uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                  buttonState === "loading"
                    ? "bg-[#85817A] text-[#FAF8F5]"
                    : buttonState === "success"
                      ? "bg-[#2A6F4E] text-[#FAF8F5]"
                      : "bg-[#111110] text-[#FAF8F5] hover:bg-[#C83E2B]"
                }`}
              >
                {buttonState === "loading" ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    <span>Saving Revisions...</span>
                  </>
                ) : buttonState === "success" ? (
                  <>
                    <FiCheck className="mr-2" />
                    <span>Revisions Saved</span>
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    <span>Commit Revisions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Collapsible Metadata & Visual Plates Inspector */}
          {inspectorOpen && (
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#111110] p-6 space-y-5">
                <h2 className="font-editorial text-xl font-bold text-[#111110] pb-3 border-b border-[#E4DFD7]">
                  Desk &amp; Thesis Inspector
                </h2>

                <div>
                  <label htmlFor="category" className={labelClass}>
                    Section Desk <span className="text-[#C83E2B]">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={generateSlug(category)}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="popularity" className={labelClass}>
                    Editorial Weight
                  </label>
                  <select
                    id="popularity"
                    name="popularity"
                    value={formData.popularity}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="low">Niche / Emerging Signal</option>
                    <option value="medium">Standard Editorial Interest</option>
                    <option value="high">High-Priority / Lead Feature</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="perspective" className={labelClass}>
                    Author Perspective / Thesis <span className="text-[#C83E2B]">*</span>
                  </label>
                  <textarea
                    id="perspective"
                    name="perspective"
                    rows={4}
                    value={formData.perspective}
                    onChange={handleChange}
                    required
                    className={`${fieldClass} leading-relaxed`}
                  />
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#111110] p-6 space-y-5">
                <h2 className="font-editorial text-xl font-bold text-[#111110] pb-3 border-b border-[#E4DFD7]">
                  Photographic Plates
                </h2>

                <div>
                  <label htmlFor="primaryImage" className={labelClass}>
                    Primary Lead Plate
                  </label>

                  {existingImages.primary && (
                    <div className="mb-3 border border-[#E4DFD7] p-2 bg-[#FAF8F5]">
                      <img
                        src={
                          existingImages.primary.startsWith("http")
                            ? existingImages.primary
                            : `${API_URL}/${existingImages.primary.replace(/\\/g, "/")}`
                        }
                        alt="Current primary"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    id="primaryImage"
                    name="primaryImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs font-mono-meta file:mr-3 file:py-1 file:px-2.5 file:border-0 file:text-xs file:font-mono-meta file:uppercase file:bg-[#111110] file:text-[#FAF8F5] hover:file:bg-[#C83E2B] file:cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-[#E4DFD7]">
                  <label htmlFor="secondaryImage" className={labelClass}>
                    Secondary In-Essay Plate
                  </label>

                  {existingImages.secondary && (
                    <div className="mb-3 border border-[#E4DFD7] p-2 bg-[#FAF8F5]">
                      <img
                        src={
                          existingImages.secondary.startsWith("http")
                            ? existingImages.secondary
                            : `${API_URL}/${existingImages.secondary.replace(/\\/g, "/")}`
                        }
                        alt="Current secondary"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    id="secondaryImage"
                    name="secondaryImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs font-mono-meta file:mr-3 file:py-1 file:px-2.5 file:border-0 file:text-xs file:font-mono-meta file:uppercase file:bg-[#111110] file:text-[#FAF8F5] hover:file:bg-[#C83E2B] file:cursor-pointer"
                  />
                </div>
              </div>
            </aside>
          )}
        </form>
      </div>
    </div>
  );
}
