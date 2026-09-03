"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function useCreateBlogForm() {
  const { data: session } = useSession();

  const formRef = useRef(null);
  const primaryInputRef = useRef(null);
  const secondaryInputRef = useRef(null);

  const [buttonState, setButtonState] = useState("idle");
  const [formData, setFormData] = useState({
    topic: "",
    views: "",
    popularity: "medium",
    category: "",
    primaryImage: null,
    secondaryImage: null,
  });
  const [previews, setPreviews] = useState({ primary: null, secondary: null });

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

  const resetForm = () => {
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
          resetForm();
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

  return {
    formRef,
    primaryInputRef,
    secondaryInputRef,
    buttonState,
    formData,
    previews,
    handleChange,
    handleSubmit,
    clearImage,
  };
}