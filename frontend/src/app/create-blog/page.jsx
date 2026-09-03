"use client";

import { useRef, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiLoader,
  FiX,
  FiUpload,
} from "react-icons/fi";
import { categories } from "../../../public/assets/blogRelatedData";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function CreateBlog() {
  const formRef = useRef(null);
  const primaryInputRef = useRef(null);
  const secondaryInputRef = useRef(null);
  const [buttonState, setButtonState] = useState("idle");
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    topic: "",
    views: "",
    popularity: "medium",
    category: "",
    primaryImage: null,
    secondaryImage: null,
  });

  const [previews, setPreviews] = useState({
    primary: null,
    secondary: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        e.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      const previewKey = name === "primaryImage" ? "primary" : "secondary";
      const reader = new FileReader();
      reader.onload = () =>
        setPreviews((prev) => ({ ...prev, [previewKey]: reader.result }));
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const clearImage = (type) => {
    if (type === "primary") {
      setFormData((prev) => ({ ...prev, primaryImage: null }));
      setPreviews((prev) => ({ ...prev, primary: null }));
      if (primaryInputRef.current) primaryInputRef.current.value = "";
    } else {
      setFormData((prev) => ({ ...prev, secondaryImage: null }));
      setPreviews((prev) => ({ ...prev, secondary: null }));
      if (secondaryInputRef.current) secondaryInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login first.");
      return;
    }

    if (!formData.primaryImage) {
      toast.error("Please add a primary image.");
      return;
    }

    setButtonState("loading");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("primary_image", formData.primaryImage);
      if (formData.secondaryImage) {
        formDataToSend.append("secondary_image", formData.secondaryImage);
      }

      const uploadResponse = await fetch(`${API_URL}/upload-images`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Image upload failed");
      }

      const imagePaths = await uploadResponse.json();

      const agentResponse = await fetch(`${API_URL}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Title: ${formData.topic}\nPerspective: ${formData.views}`,
        }),
      });

      const agentResult = await agentResponse.json();

      const blogResponse = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify({
          title: formData.topic,
          perspective: formData.views,
          category: formData.category,
          popularity: formData.popularity,
          primary_image: imagePaths.primary,
          secondary_image: imagePaths.secondary,
          introContentHeading: agentResult.output.introContentHeading,
          introContent: agentResult.output.introContent,
          contentHeading: agentResult.output.contentHeading,
          content: agentResult.output.content,
        }),
      });

      if (blogResponse.ok) {
        setButtonState("success");
        toast.success("Blog created successfully!");
        setTimeout(() => {
          setFormData({
            topic: "",
            views: "",
            popularity: "medium",
            category: "",
            primaryImage: null,
            secondaryImage: null,
          });
          setPreviews({ primary: null, secondary: null });
          if (formRef.current) formRef.current.reset();
          setButtonState("idle");
        }, 2000);
      } else {
        const data = await blogResponse.json().catch(() => null);
        throw new Error(data?.detail || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.message || "Failed to create blog");
      setButtonState("idle");
    }
  };

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
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Blog Topic *
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-middle/30 focus:border-middle transition-colors"
                  placeholder="What is the main topic of your blog?"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="views"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Your Perspective *
                </label>
                <textarea
                  id="views"
                  name="views"
                  rows={4}
                  value={formData.views}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-middle/30 focus:border-middle transition-colors resize-none"
                  placeholder="Share your unique perspective or angle on this topic..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="popularity"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Topic Popularity
                  </label>
                  <select
                    id="popularity"
                    name="popularity"
                    value={formData.popularity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-middle/30 focus:border-middle transition-colors"
                  >
                    <option value="low">Not very popular</option>
                    <option value="medium">Moderately popular</option>
                    <option value="high">Very popular</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-middle/30 focus:border-middle transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
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

function ImageUploadBox({ inputRef, name, preview, onChange, onClear }) {
  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-middle hover:bg-middle/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-middle/10 flex items-center justify-center mb-2 transition-colors">
            <FiUpload
              className="text-gray-400 group-hover:text-middle transition-colors"
              size={18}
            />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-middle transition-colors">
            Click to upload
          </span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        id={name}
        name={name}
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
