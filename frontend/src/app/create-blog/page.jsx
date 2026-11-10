"use client";

import { FiArrowRight, FiCheck, FiLoader } from "react-icons/fi";
import { categories } from "../../../public/assets/blogRelatedData";
import ImageUploadBox from "../../components/ImageUploadBox";
import FormField from "../../components/FormField";
import { useCreateBlogForm } from "../../utils/useCreateBlogForm";

const popularityOptions = [
  { value: "low", label: "Niche / Emerging Signal" },
  { value: "medium", label: "Standard Editorial Interest" },
  { value: "high", label: "High-Priority / Lead Feature" },
];

export default function CreateBlog() {
  const {
    formRef,
    primaryInputRef,
    secondaryInputRef,
    buttonState,
    formData,
    previews,
    handleChange,
    handleSubmit,
    clearImage,
  } = useCreateBlogForm();

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <FiLoader className="animate-spin mr-2" />
            <span>Drafting Dispatch via Agent...</span>
          </>
        );
      case "success":
        return (
          <>
            <FiCheck className="mr-2" />
            <span>Dispatch Published</span>
          </>
        );
      default:
        return (
          <>
            <span>Commission &amp; Publish Essay</span>
            <FiArrowRight className="ml-2" />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="pb-8 mb-10 border-b border-[#111110] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
              AI Editorial Studio — Gemini 2.5 Flash Agent
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#111110] mt-1">
              Commission New Dispatch
            </h1>
          </div>
          <p className="text-xs font-mono-meta text-[#57544E] max-w-xs">
            Provide your core thesis and visual plates; the autonomous writer agent will structure and compose the full essay.
          </p>
        </header>

        <div className="bg-[#FFFFFF] border border-[#111110] shadow-[6px_6px_0px_#111110]">
          <form ref={formRef} onSubmit={handleSubmit} className="divide-y divide-[#E4DFD7]">
            {/* Section 01: Core Brief */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#E4DFD7]">
                <h2 className="font-editorial text-2xl font-bold text-[#111110]">
                  01. Editorial Thesis &amp; Angle
                </h2>
                <span className="font-mono-meta text-[11px] uppercase tracking-wider text-[#85817A]">
                  Required Input
                </span>
              </div>

              <FormField
                id="topic"
                name="topic"
                label="Working Headline / Topic"
                required
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Why Local-First Software Is Returning to the Enterprise"
              />

              <FormField
                type="textarea"
                id="views"
                name="views"
                rows={5}
                label="Author's Perspective & Core Argument"
                required
                value={formData.views}
                onChange={handleChange}
                placeholder="Outline your stance, key observations, or contrarian thesis that the agent should anchor the essay around..."
              />
            </div>

            {/* Section 02: Classification */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#E4DFD7]">
                <h2 className="font-editorial text-2xl font-bold text-[#111110]">
                  02. Publication Desk &amp; Signal
                </h2>
                <span className="font-mono-meta text-[11px] uppercase tracking-wider text-[#85817A]">
                  Indexing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  type="select"
                  id="category"
                  name="category"
                  label="Section Desk"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select a publication section" },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ]}
                />

                <FormField
                  type="select"
                  id="popularity"
                  name="popularity"
                  label="Editorial Weight"
                  value={formData.popularity}
                  onChange={handleChange}
                  options={popularityOptions}
                />
              </div>
            </div>

            {/* Section 03: Visual Plates */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#E4DFD7]">
                <h2 className="font-editorial text-2xl font-bold text-[#111110]">
                  03. Photographic Plates
                </h2>
                <span className="font-mono-meta text-[11px] uppercase tracking-wider text-[#85817A]">
                  Cloudinary CDN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono-meta uppercase tracking-[0.12em] text-[#111110] font-medium mb-2">
                    Primary Lead Plate <span className="text-[#C83E2B]">*</span>
                  </label>
                  <ImageUploadBox
                    inputRef={primaryInputRef}
                    name="primaryImage"
                    preview={previews.primary}
                    onChange={handleChange}
                    onClear={() => clearImage("primary")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-meta uppercase tracking-[0.12em] text-[#111110] font-medium mb-2">
                    Secondary In-Essay Plate (Optional)
                  </label>
                  <ImageUploadBox
                    inputRef={secondaryInputRef}
                    name="secondaryImage"
                    preview={previews.secondary}
                    onChange={handleChange}
                    onClear={() => clearImage("secondary")}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="p-6 sm:p-8 bg-[#F3EFEA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-mono-meta text-[#57544E]">
                Agent composes ~900-char lead + ~3,600-char body analysis.
              </p>

              <button
                type="submit"
                disabled={buttonState === "loading"}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-mono-meta uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                  buttonState === "loading"
                    ? "bg-[#85817A] text-[#FAF8F5] cursor-not-allowed"
                    : buttonState === "success"
                      ? "bg-[#2A6F4E] text-[#FAF8F5]"
                      : "bg-[#111110] text-[#FAF8F5] hover:bg-[#C83E2B]"
                }`}
              >
                {getButtonContent()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}