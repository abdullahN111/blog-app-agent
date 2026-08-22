"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FiArrowLeft,
  FiCheck,
  FiFileText,
  FiLoader,
  FiSave,
} from "react-icons/fi";
import { categories } from "../../../../../public/assets/blogRelatedData";
import { generateSlug } from "../../../../utils/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState("idle");
  const [error, setError] = useState("");

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
        setError("");

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
        setError("Unable to load this blog.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      setError("Please login first.");
      return;
    }

    setButtonState("loading");
    setError("");

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

      setError(error.message || "Something went wrong.");

      setButtonState("idle");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <FiLoader className="animate-spin text-xl" />
          Loading blog...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            You're not signed in
          </h1>

          <p className="text-gray-500 mt-3">Please login to edit your blogs.</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Blog not found</h1>

          <p className="text-gray-500 mt-3">{error}</p>

          <button
            onClick={() => router.push("/account")}
            className="mt-6 inline-flex items-center px-5 py-3 bg-middle text-white rounded-lg"
          >
            <FiArrowLeft className="mr-2" />
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-higher rounded-full mb-4">
            <FiFileText className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Blog Post
          </h1>

          <p className="text-lg text-gray-600">
            Update your article, images, category, and content.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/account")}
          className="mb-5 inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Account
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-higher overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Blog Title *
                </label>

                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                />

                <p className="mt-2 text-xs text-gray-500">
                  The URL slug will be automatically regenerated from the title.
                </p>
              </div>

              <div>
                <label
                  htmlFor="perspective"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Your Perspective *
                </label>

                <textarea
                  id="perspective"
                  name="perspective"
                  rows={4}
                  value={formData.perspective}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
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
                    className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
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
                    required
                    className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                  >
                    <option value="">Select a category</option>

                    {categories.map((category) => (
                      <option key={category} value={generateSlug(category)}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="introContentHeading"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Introduction Heading
                </label>

                <input
                  type="text"
                  id="introContentHeading"
                  name="introContentHeading"
                  value={formData.introContentHeading}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="introContent"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Introduction / Short Description
                </label>

                <textarea
                  id="introContent"
                  name="introContent"
                  rows={6}
                  value={formData.introContent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contentHeading"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Content Heading
                </label>

                <input
                  type="text"
                  id="contentHeading"
                  name="contentHeading"
                  value={formData.contentHeading}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Full Blog Content
                </label>

                <textarea
                  id="content"
                  name="content"
                  rows={18}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg focus:outline-middle transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="primaryImage"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Primary Image
                </label>

                {existingImages.primary && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Current primary image
                    </p>

                    <img
                      src={`${API_URL}/${existingImages.primary.replace(
                        /\\/g,
                        "/",
                      )}`}
                      alt="Current primary"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <input
                  type="file"
                  id="primaryImage"
                  name="primaryImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-middle file:text-white"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to keep the current image.
                </p>
              </div>

              <div>
                <label
                  htmlFor="secondaryImage"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Secondary Image
                </label>

                {existingImages.secondary && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Current secondary image
                    </p>

                    <img
                      src={`${API_URL}/${existingImages.secondary.replace(
                        /\\/g,
                        "/",
                      )}`}
                      alt="Current secondary"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <input
                  type="file"
                  id="secondaryImage"
                  name="secondaryImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-higher border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-middle file:text-white"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to keep the current image.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={buttonState === "loading"}
                className={`w-full flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg transition-all duration-300 ${
                  buttonState === "loading"
                    ? "bg-gray-400"
                    : buttonState === "success"
                      ? "bg-green-500"
                      : "bg-middle hover:bg-[#f31e65ef]"
                }`}
              >
                {buttonState === "loading" ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : buttonState === "success" ? (
                  <>
                    <FiCheck className="mr-2" />
                    Changes Saved!
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Changes will be saved to your existing blog.</p>
        </div>
      </div>
    </div>
  );
}
