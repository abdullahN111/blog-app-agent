import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DEFAULT_BUILTIN_PERSONAS } from "../../public/assets/blogRelatedData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function useCreateBlogForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const formRef = useRef(null);
  const primaryInputRef = useRef(null);
  const secondaryInputRef = useRef(null);

  const [buttonState, setButtonState] = useState("idle");
  const [studioStage, setStudioStage] = useState("brief"); // "brief" | "review"
  const [assistLoading, setAssistLoading] = useState(null);

  const [personas, setPersonas] = useState(DEFAULT_BUILTIN_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState("default-editorial");
  const [quota, setQuota] = useState(null);
  const [userGeminiKey, setUserGeminiKey] = useState("");

  const [formData, setFormData] = useState({
    topic: "",
    views: "",
    popularity: "medium",
    category: "",
    primaryImage: null,
    secondaryImage: null,
    // Stage 2 editable manuscript fields
    title: "",
    introContentHeading: "",
    introContent: "",
    contentHeading: "",
    content: "",
  });

  const [agentMeta, setAgentMeta] = useState({
    headline_alternatives: [],
    suggested_category: "",
    seo_tags: [],
    quality_score: null,
    editorial_notes: "",
    cached: false,
  });

  const [previews, setPreviews] = useState({ primary: null, secondary: null });
  const [uploadedPaths, setUploadedPaths] = useState({ primary: null, secondary: null });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = window.localStorage.getItem("blogout_user_gemini_key") || "";
      setUserGeminiKey(savedKey);
    }
  }, []);

  const saveUserGeminiKey = (key) => {
    setUserGeminiKey(key);
    if (typeof window !== "undefined") {
      if (key.trim()) {
        window.localStorage.setItem("blogout_user_gemini_key", key.trim());
      } else {
        window.localStorage.removeItem("blogout_user_gemini_key");
      }
    }
  };

  const getLocalCustomPersonas = () => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("blogout_custom_personas");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const fetchStudioContext = useCallback(async () => {
    const localCustom = getLocalCustomPersonas();
    try {
      const headers = {};
      if (session?.id_token) {
        headers.Authorization = `Bearer ${session.id_token}`;
      }
      const [personasRes, quotaRes] = await Promise.all([
        fetch(`${API_URL}/agent/personas`, { headers }).catch(() => null),
        fetch(`${API_URL}/agent/quota`, { headers }).catch(() => null),
      ]);

      if (personasRes && personasRes.ok) {
        const data = await personasRes.json();
        const serverPersonas = data.personas || DEFAULT_BUILTIN_PERSONAS;
        const mergedIds = new Set(serverPersonas.map((p) => p.name.toLowerCase()));
        const uniqueLocal = localCustom.filter(
          (lp) => !mergedIds.has(lp.name.toLowerCase())
        );
        setPersonas([...serverPersonas, ...uniqueLocal]);
      } else {
        setPersonas([...DEFAULT_BUILTIN_PERSONAS, ...localCustom]);
      }

      if (quotaRes && quotaRes.ok) {
        const qData = await quotaRes.json();
        setQuota(qData);
      }
    } catch (err) {
      setPersonas([...DEFAULT_BUILTIN_PERSONAS, ...localCustom]);
    }
  }, [session?.id_token]);

  useEffect(() => {
    fetchStudioContext();
  }, [fetchStudioContext]);

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
      setUploadedPaths((prev) => ({ ...prev, [previewKey]: null }));
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
      setUploadedPaths((prev) => ({ ...prev, primary: null }));
      if (primaryInputRef.current) primaryInputRef.current.value = "";
    } else {
      setFormData((prev) => ({ ...prev, secondaryImage: null }));
      setPreviews((prev) => ({ ...prev, secondary: null }));
      setUploadedPaths((prev) => ({ ...prev, secondary: null }));
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
      title: "",
      introContentHeading: "",
      introContent: "",
      contentHeading: "",
      content: "",
    });
    setAgentMeta({
      headline_alternatives: [],
      suggested_category: "",
      seo_tags: [],
      quality_score: null,
      editorial_notes: "",
      cached: false,
    });
    setPreviews({ primary: null, secondary: null });
    setUploadedPaths({ primary: null, secondary: null });
    setStudioStage("brief");
    if (formRef.current) formRef.current.reset();
  };

  // Stage 1: Generate Draft via AI Agent for Interactive Review
  const handleGenerateDraft = async (e) => {
    if (e) e.preventDefault();

    if (!session) {
      toast.error("Please sign in first.");
      return;
    }

    if (!formData.topic.trim() || !formData.views.trim()) {
      toast.error("Please provide both a Working Headline and your Perspective.");
      return;
    }

    if (!formData.primaryImage && !uploadedPaths.primary) {
      toast.error("Please select a primary lead plate.");
      return;
    }

    setButtonState("loading");
    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.id_token) {
        headers.Authorization = `Bearer ${session.id_token}`;
      }
      if (userGeminiKey.trim()) {
        headers["X-Gemini-Key"] = userGeminiKey.trim();
      }

      const activePersona =
        personas.find((p) => p.id === selectedPersonaId) || DEFAULT_BUILTIN_PERSONAS[0];
      const personaBrief = activePersona
        ? `\nEditorial Persona: ${activePersona.name} (${activePersona.tone})\nStyle Directives: ${activePersona.system_instructions}`
        : "";

      const agentResponse = await fetch(`/api/agent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          input: `Title: ${formData.topic}\nPerspective: ${formData.views}${personaBrief}`,
          persona_id: selectedPersonaId,
        }),
      });

      if (!agentResponse.ok) {
        const errData = await agentResponse.json().catch(() => null);
        throw new Error(errData?.detail || "AI Agent generation failed");
      }

      const agentResult = await agentResponse.json();
      const out = agentResult.output || {};

      setFormData((prev) => ({
        ...prev,
        title: out.title || prev.topic,
        category: prev.category || out.suggested_category || "Tech",
        introContentHeading: out.introContentHeading || "",
        introContent: out.introContent || "",
        contentHeading: out.contentHeading || "",
        content: out.content || "",
      }));

      setAgentMeta({
        headline_alternatives: out.headline_alternatives || [],
        suggested_category: out.suggested_category || "",
        seo_tags: out.seo_tags || [],
        quality_score: out.quality_score || 88,
        editorial_notes: out.editorial_notes || "",
        cached: Boolean(agentResult.cached),
      });

      setStudioStage("review");
      setButtonState("idle");
      fetchStudioContext();
      toast.success(
        agentResult.cached
          ? "Loaded draft from studio cache (0 tokens used)."
          : "Manuscript drafted! Review, refine, or publish below."
      );
    } catch (error) {
      console.error("Error generating draft:", error);
      toast.error(error.message || "Failed to generate manuscript");
      setButtonState("idle");
    }
  };

  // Contextual AI Refinement in Stage 2
  const handleRunAssist = async (action, targetField = "content") => {
    const sourceText = formData[targetField];
    if (!sourceText || sourceText.trim().length < 15) {
      toast.error("Not enough text in manuscript to run this editorial tool.");
      return;
    }

    setAssistLoading(action);
    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.id_token) {
        headers.Authorization = `Bearer ${session.id_token}`;
      }
      if (userGeminiKey.trim()) {
        headers["X-Gemini-Key"] = userGeminiKey.trim();
      }

      const res = await fetch(`/api/agent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          _endpoint: "assist",
          action,
          text: sourceText,
          context_title: formData.title || formData.topic,
          persona_id: selectedPersonaId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Editorial assist failed");
      }

      const { output } = await res.json();
      if (action !== "evaluate" && output.revised_text) {
        setFormData((prev) => ({
          ...prev,
          [targetField]: output.revised_text,
        }));
      }

      setAgentMeta((prev) => ({
        ...prev,
        quality_score: output.quality_score || prev.quality_score,
        editorial_notes: output.editorial_summary || prev.editorial_notes,
        headline_alternatives:
          output.headline_suggestions?.length > 0
            ? output.headline_suggestions
            : prev.headline_alternatives,
      }));

      fetchStudioContext();
      toast.success(output.editorial_summary || "Manuscript updated.");
    } catch (error) {
      toast.error(error.message || "Failed to run editorial assist");
    } finally {
      setAssistLoading(null);
    }
  };

  // Stage 2: Save as Draft or Publish Live
  const handleSaveBlog = async (publishNow = true) => {
    if (!session) {
      toast.error("Please login first.");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a Section Desk (Category).");
      return;
    }

    setButtonState("loading");
    try {
      let currentImagePaths = uploadedPaths;

      if (!currentImagePaths.primary) {
        if (!formData.primaryImage) {
          throw new Error("Please add a primary image.");
        }
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

        currentImagePaths = await uploadResponse.json();
        setUploadedPaths(currentImagePaths);
      }

      // If user triggered direct submit without Stage 2 draft yet, generate first
      let finalTitle = formData.title || formData.topic;
      let finalIntroHeading = formData.introContentHeading;
      let finalIntro = formData.introContent;
      let finalContentHeading = formData.contentHeading;
      let finalContent = formData.content;

      if (!finalContent) {
        const headers = { "Content-Type": "application/json" };
        if (session?.id_token) {
          headers.Authorization = `Bearer ${session.id_token}`;
        }
        if (userGeminiKey.trim()) {
          headers["X-Gemini-Key"] = userGeminiKey.trim();
        }
        const agentResponse = await fetch(`/api/agent`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            input: `Title: ${formData.topic}\nPerspective: ${formData.views}`,
            persona_id: selectedPersonaId,
          }),
        });
        if (!agentResponse.ok) {
          const errData = await agentResponse.json().catch(() => null);
          throw new Error(errData?.detail || "AI Agent generation failed");
        }
        const agentResult = await agentResponse.json();
        finalTitle = agentResult.output.title || formData.topic;
        finalIntroHeading = agentResult.output.introContentHeading;
        finalIntro = agentResult.output.introContent;
        finalContentHeading = agentResult.output.contentHeading;
        finalContent = agentResult.output.content;
      }

      const blogResponse = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          perspective: formData.views,
          category: formData.category,
          popularity: formData.popularity,
          primary_image: currentImagePaths.primary,
          secondary_image: currentImagePaths.secondary,
          introContentHeading: finalIntroHeading,
          introContent: finalIntro,
          contentHeading: finalContentHeading,
          content: finalContent,
          published: publishNow,
        }),
      });

      if (blogResponse.ok) {
        const savedBlog = await blogResponse.json();
        setButtonState("success");
        toast.success(
          publishNow
            ? "Dispatch published to the live archive!"
            : "Saved to your Editorial Desk as a Draft."
        );
        setTimeout(() => {
          resetForm();
          setButtonState("idle");
          if (publishNow && savedBlog?.slug) {
            router.push(`/blogs/blog/${savedBlog.slug}`);
          } else {
            router.push("/account");
          }
        }, 1200);
      } else {
        const data = await blogResponse.json().catch(() => null);
        throw new Error(data?.detail || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error.message || "Failed to save blog");
      setButtonState("idle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (studioStage === "brief") {
      await handleGenerateDraft(e);
    } else {
      await handleSaveBlog(true);
    }
  };

  const handleCreatePersona = async (personaPayload) => {
    if (!session) {
      toast.error("Please sign in to create a custom persona.");
      return false;
    }
    try {
      const res = await fetch(`${API_URL}/agent/personas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify(personaPayload),
      }).catch(() => null);

      if (res && res.ok) {
        const created = await res.json();
        await fetchStudioContext();
        setSelectedPersonaId(`custom-${created.id}`);
        toast.success(`Custom agent "${created.name}" created!`);
        return true;
      }

      // Fallback if backend hasn't been redeployed with /agent/personas yet
      const fallbackPersona = {
        id: `local-${Date.now()}`,
        name: personaPayload.name.trim(),
        role_description: personaPayload.role_description.trim(),
        tone: personaPayload.tone.trim() || "Analytical & Editorial",
        system_instructions: personaPayload.system_instructions.trim(),
        is_public: Boolean(personaPayload.is_public),
        is_owner: true,
        builtin: false,
      };
      const existing = getLocalCustomPersonas();
      const updated = [fallbackPersona, ...existing];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("blogout_custom_personas", JSON.stringify(updated));
      }
      await fetchStudioContext();
      setSelectedPersonaId(fallbackPersona.id);
      toast.success(`Custom agent "${fallbackPersona.name}" saved to Studio!`);
      return true;
    } catch (err) {
      toast.error(err.message || "Could not create persona");
      return false;
    }
  };

  return {
    formRef,
    primaryInputRef,
    secondaryInputRef,
    buttonState,
    studioStage,
    setStudioStage,
    assistLoading,
    personas,
    selectedPersonaId,
    setSelectedPersonaId,
    quota,
    userGeminiKey,
    saveUserGeminiKey,
    formData,
    setFormData,
    agentMeta,
    previews,
    handleChange,
    handleSubmit,
    handleGenerateDraft,
    handleRunAssist,
    handleSaveBlog,
    handleCreatePersona,
    clearImage,
  };
}

export default useCreateBlogForm;