"use client";

import { FiArrowRight, FiBookOpen, FiCheck, FiLoader } from "react-icons/fi";
import { categories } from "../../../public/assets/blogRelatedData";
import ImageUploadBox from "../../components/ImageUploadBox";
import FormField from "../../components/FormField";
import { useCreateBlogForm } from "../../utils/useCreateBlogForm";

const popularityOptions = [
  { value: "low", label: "Not very popular" },
  { value: "medium", label: "Moderately popular" },
  { value: "high", label: "Very popular" },
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
            Generating...
          </>
        );
      case "success":
        return (
          <>
            <FiCheck className="mr-2" />
            Blog Generated!
          </>
        );
      default:
        return (
          <>
            Generate Blog
            <FiArrowRight className="ml-2" />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-middle/20 to-middle/5 rounded-2xl mb-4">
            <FiBookOpen className="w-8 h-8 text-middle" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Blog Post
          </h1>
          <p className="text-lg text-gray-600">
            Provide the essential details and let AI write the rest
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              <FormField
                id="topic"
                name="topic"
                label="Blog Topic"
                required
                value={formData.topic}
                onChange={handleChange}
                placeholder="What is the main topic of your blog?"
              />

              <FormField
                type="textarea"
                id="views"
                name="views"
                label="Your Perspective"
                required
                value={formData.views}
                onChange={handleChange}
                placeholder="Share your unique perspective or angle on this topic..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  type="select"
                  id="popularity"
                  name="popularity"
                  label="Topic Popularity"
                  value={formData.popularity}
                  onChange={handleChange}
                  options={popularityOptions}
                />

                <FormField
                  type="select"
                  id="category"
                  name="category"
                  label="Category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select a category" },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Primary Image *
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
                  <label className="block text-sm font-medium text-primary mb-2">
                    Secondary Image
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

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={buttonState === "loading"}
                className={`w-full flex items-center justify-center px-6 py-3.5 text-white font-medium rounded-xl transition-all duration-300 cursor-pointer ${
                  buttonState === "loading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : buttonState === "success"
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-middle to-[#f31e65] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {getButtonContent()}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Your blog will be automatically generated by our AI based on the
            information you provide.
          </p>
        </div>
      </div>
    </div>
  );
}