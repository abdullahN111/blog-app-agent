"use client";

import { useState } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiLoader,
  FiSliders,
  FiPlus,
  FiRefreshCw,
  FiZap,
  FiFileText,
  FiKey,
  FiX,
} from "react-icons/fi";
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
  } = useCreateBlogForm();

  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: "",
    role_description: "",
    tone: "Analytical & Editorial",
    system_instructions: "",
    is_public: false,
  });
  const [creatingPersona, setCreatingPersona] = useState(false);

  const selectedPersona =
    personas.find((p) => p.id === selectedPersonaId) || personas[0];

  const onSubmitNewPersona = async (e) => {
    e.preventDefault();
    setCreatingPersona(true);
    const ok = await handleCreatePersona(newPersona);
    setCreatingPersona(false);
    if (ok) {
      setNewPersona({
        name: "",
        role_description: "",
        tone: "Analytical & Editorial",
        system_instructions: "",
        is_public: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 md:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Studio Header & Quota Strip */}
        <header className="pb-6 mb-8 border-b border-[#111110] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#111110] text-[#FAF8F5] font-mono-meta text-[11px] uppercase tracking-[0.14em]">
                AI Editorial Studio
              </span>
              <span className="px-2.5 py-0.5 border border-[#111110] bg-[#F3EFEA] text-[#C83E2B] font-mono-meta text-[11px] uppercase tracking-[0.14em]">
                {userGeminiKey ? "BYOK Unlimited Mode" : "Gemini 2.5 Flash"}
              </span>
              {quota?.authenticated && !userGeminiKey && (
                <span className="px-2.5 py-0.5 border border-[#E4DFD7] bg-[#FFFFFF] text-[#111110] font-mono-meta text-[11px] uppercase tracking-[0.12em]">
                  Quota: {quota.remaining}/{quota.daily_limit} Credits Left (24h)
                </span>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#111110] mt-1">
              {studioStage === "brief"
                ? "01. Commission New Dispatch"
                : "02. Manuscript Review & Refinement"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Step Switcher */}
            <div className="inline-flex border border-[#111110] bg-[#FFFFFF]">
              <button
                type="button"
                onClick={() => setStudioStage("brief")}
                className={`px-3.5 py-2 text-xs font-mono-meta uppercase tracking-wider cursor-pointer transition-colors ${
                  studioStage === "brief"
                    ? "bg-[#111110] text-[#FAF8F5]"
                    : "text-[#57544E] hover:text-[#111110]"
                }`}
              >
                1. Brief
              </button>
              <button
                type="button"
                disabled={!formData.content}
                onClick={() => setStudioStage("review")}
                className={`px-3.5 py-2 text-xs font-mono-meta uppercase tracking-wider border-l border-[#111110] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  studioStage === "review"
                    ? "bg-[#111110] text-[#FAF8F5]"
                    : "text-[#57544E] hover:text-[#111110]"
                }`}
              >
                2. Manuscript
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#111110] bg-[#FFFFFF] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            >
              <FiSliders size={14} />
              <span>Agents &amp; API Quota</span>
            </button>
          </div>
        </header>

        {/* STAGE 1: COMMISSION BRIEF */}
        {studioStage === "brief" && (
          <div className="bg-[#FFFFFF] border border-[#111110] shadow-[6px_6px_0px_#111110]">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="divide-y divide-[#E4DFD7]"
            >
              {/* Active Agent Persona Selector */}
              <div className="p-6 sm:p-8 bg-[#F3EFEA]/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#C83E2B]">
                      Assigned Writer Agent
                    </span>
                    <h2 className="font-editorial text-xl font-bold text-[#111110]">
                      Select Editorial Persona
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettingsDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono-meta uppercase tracking-wider text-[#C83E2B] hover:underline cursor-pointer"
                  >
                    <FiPlus size={14} />
                    <span>Create Custom Persona</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {personas.map((p) => {
                    const active = p.id === selectedPersonaId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPersonaId(p.id)}
                        className={`text-left p-3.5 border transition-colors cursor-pointer flex flex-col justify-between ${
                          active
                            ? "border-[#111110] bg-[#111110] text-[#FAF8F5]"
                            : "border-[#E4DFD7] bg-[#FFFFFF] text-[#111110] hover:border-[#111110]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-editorial font-bold text-base leading-tight">
                              {p.name}
                            </span>
                            {!p.builtin && (
                              <span className="text-[10px] font-mono-meta uppercase px-1.5 py-0.5 bg-[#C83E2B] text-[#FAF8F5]">
                                Custom
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs line-clamp-2 leading-relaxed ${
                              active ? "text-[#FAF8F5]/80" : "text-[#57544E]"
                            }`}
                          >
                            {p.role_description}
                          </p>
                        </div>
                        <span
                          className={`mt-3 pt-2 border-t text-[10px] font-mono-meta uppercase tracking-wider ${
                            active
                              ? "border-[#FAF8F5]/20 text-[#FAF8F5]/90"
                              : "border-[#E4DFD7] text-[#85817A]"
                          }`}
                        >
                          Tone: {p.tone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
                    Auto-Suggested if Blank
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    type="select"
                    id="category"
                    name="category"
                    label="Section Desk (Optional — AI Auto-Selects if Blank)"
                    value={formData.category}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Auto-detect best category via AI" },
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

              {/* Action Bar */}
              <div className="p-6 sm:p-8 bg-[#F3EFEA] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono-meta text-[#57544E]">
                  <span>
                    Active Persona:{" "}
                    <strong className="text-[#111110]">
                      {selectedPersona?.name || "Managing Essayist"}
                    </strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={buttonState === "loading"}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-mono-meta uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                    buttonState === "loading"
                      ? "bg-[#85817A] text-[#FAF8F5] cursor-not-allowed"
                      : "bg-[#111110] text-[#FAF8F5] hover:bg-[#C83E2B]"
                  }`}
                >
                  {buttonState === "loading" ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      <span>Drafting Manuscript via Agent...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Manuscript Draft</span>
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAGE 2: INTERACTIVE MANUSCRIPT REVIEW, AI CO-PILOT & PUBLISH */}
        {studioStage === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Main Column: Editable Manuscript */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#111110] shadow-[6px_6px_0px_#111110] divide-y divide-[#E4DFD7]">
              {/* Contextual AI Co-Pilot Toolbar */}
              <div className="p-4 sm:p-5 bg-[#F3EFEA] flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#111110] font-medium flex items-center gap-1.5">
                  <FiZap className="text-[#C83E2B]" />
                  <span>AI Co-Pilot Refine:</span>
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "sharpen", label: "Sharpen Prose" },
                    { id: "expand", label: "Expand Analysis" },
                    { id: "condense", label: "Condense 25%" },
                    { id: "counter_argument", label: "+ Steelman Counter" },
                    { id: "evaluate", label: "Re-Evaluate Score" },
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

              {/* A/B Headline Picker + Title */}
              <div className="p-6 sm:p-8 space-y-4">
                <FormField
                  id="title"
                  name="title"
                  label="Final Publication Headline"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />

                {agentMeta.headline_alternatives?.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-mono-meta uppercase tracking-wider text-[#57544E] mb-2">
                      A/B Headline Alternatives (Click to Swap):
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {agentMeta.headline_alternatives.map((alt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, title: alt }))
                          }
                          className="text-left px-3 py-2 border border-[#E4DFD7] bg-[#FAF8F5] hover:border-[#111110] text-xs font-editorial text-[#111110] transition-colors cursor-pointer"
                        >
                          <span className="font-mono-meta text-[10px] text-[#C83E2B] mr-2">
                            OPT 0{idx + 1}
                          </span>
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lead Section */}
              <div className="p-6 sm:p-8 space-y-5">
                <FormField
                  id="introContentHeading"
                  name="introContentHeading"
                  label="Lead Subheading"
                  value={formData.introContentHeading}
                  onChange={handleChange}
                />

                <FormField
                  type="textarea"
                  id="introContent"
                  name="introContent"
                  rows={6}
                  label="Opening Lead (~900 chars)"
                  value={formData.introContent}
                  onChange={handleChange}
                />
              </div>

              {/* Main Body Section */}
              <div className="p-6 sm:p-8 space-y-5">
                <FormField
                  id="contentHeading"
                  name="contentHeading"
                  label="Core Analysis Subheading"
                  value={formData.contentHeading}
                  onChange={handleChange}
                />

                <FormField
                  type="textarea"
                  id="content"
                  name="content"
                  rows={18}
                  label="Full Essay Body (~3,600 chars)"
                  value={formData.content}
                  onChange={handleChange}
                />
              </div>

              {/* Bottom Publish / Save Draft Bar */}
              <div className="p-6 sm:p-8 bg-[#F3EFEA] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStudioStage("brief")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#111110] bg-[#FFFFFF] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  <FiArrowLeft size={14} />
                  <span>Back to Brief</span>
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={buttonState === "loading"}
                    onClick={() => handleSaveBlog(false)}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-[#111110] bg-[#FFFFFF] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FiFileText size={14} />
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={buttonState === "loading"}
                    onClick={() => handleSaveBlog(true)}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-[#C83E2B] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider font-medium hover:bg-[#A63020] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {buttonState === "loading" ? (
                      <>
                        <FiLoader className="animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck size={15} />
                        <span>Publish Dispatch Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Evaluation & Metadata Inspector */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#111110] p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD7]">
                  <span className="font-mono-meta text-xs uppercase tracking-wider text-[#111110] font-semibold">
                    Editorial Evaluation
                  </span>
                  {agentMeta.quality_score && (
                    <span className="px-2.5 py-1 bg-[#111110] text-[#FAF8F5] font-mono-meta text-xs font-semibold">
                      Score: {agentMeta.quality_score}/100
                    </span>
                  )}
                </div>

                {agentMeta.editorial_notes && (
                  <div>
                    <p className="text-[11px] font-mono-meta uppercase tracking-wider text-[#85817A] mb-1">
                      Agent Desk Notes
                    </p>
                    <p className="text-xs text-[#262522] leading-relaxed bg-[#FAF8F5] p-3 border border-[#E4DFD7]">
                      {agentMeta.editorial_notes}
                    </p>
                  </div>
                )}

                {agentMeta.seo_tags?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-mono-meta uppercase tracking-wider text-[#85817A] mb-2">
                      Auto-Extracted SEO Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {agentMeta.seo_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-[#F3EFEA] border border-[#E4DFD7] text-[11px] font-mono-meta text-[#111110]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#E4DFD7] space-y-4">
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

                <button
                  type="button"
                  disabled={buttonState === "loading"}
                  onClick={handleGenerateDraft}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-[#111110] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                >
                  <FiRefreshCw size={13} />
                  <span>Regenerate Full Draft</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER: CUSTOM AGENT BUILDER & BYOK QUOTA SETTINGS */}
      {isSettingsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#111110]/50">
          <div className="w-full max-w-lg bg-[#FAF8F5] border-l border-[#111110] h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#111110]">
                <div>
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#C83E2B]">
                    Studio Configuration
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#111110]">
                    Custom Agents &amp; Quota
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsDrawerOpen(false)}
                  className="w-9 h-9 border border-[#111110] bg-[#FFFFFF] flex items-center justify-center text-[#111110] hover:bg-[#111110] hover:text-[#FAF8F5] cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Free-Tier Quota & BYOK Key */}
              <div className="bg-[#FFFFFF] border border-[#111110] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-meta text-xs uppercase tracking-wider font-semibold text-[#111110] flex items-center gap-2">
                    <FiKey className="text-[#C83E2B]" />
                    <span>Gemini 2.5 Flash Quota &amp; BYOK</span>
                  </span>
                  {quota && (
                    <span className="text-[11px] font-mono-meta text-[#57544E]">
                      Pool RPM: {quota.global_rpm_used}/{quota.global_rpm_limit}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#57544E] leading-relaxed">
                  Registered users receive {quota?.daily_limit || 5} free studio generations every 24 hours on our shared pool. To unlock unlimited generations and bypass shared rate limits, paste your own free Google AI Studio key below (stored locally in your browser).
                </p>

                <div>
                  <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1.5">
                    Personal Gemini API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={userGeminiKey}
                    onChange={(e) => saveUserGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs font-mono-meta text-[#111110] focus:outline-none focus:border-[#C83E2B]"
                  />
                </div>
              </div>

              {/* Create Custom Agent Persona Form */}
              <form
                onSubmit={onSubmitNewPersona}
                className="bg-[#FFFFFF] border border-[#111110] p-5 space-y-4"
              >
                <div>
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#C83E2B]">
                    Democratized Agent Builder
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-[#111110]">
                    Create Custom Writer Persona
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                    Persona Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPersona.name}
                    onChange={(e) =>
                      setNewPersona((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g., investigative Biographer"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                      Role Summary *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPersona.role_description}
                      onChange={(e) =>
                        setNewPersona((p) => ({
                          ...p,
                          role_description: e.target.value,
                        }))
                      }
                      placeholder="Short role description..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                      Voice / Tone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPersona.tone}
                      onChange={(e) =>
                        setNewPersona((p) => ({ ...p, tone: e.target.value }))
                      }
                      placeholder="e.g., Wry, Historical, Narrative"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                    System Instructions &amp; Style Rules *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newPersona.system_instructions}
                    onChange={(e) =>
                      setNewPersona((p) => ({
                        ...p,
                        system_instructions: e.target.value,
                      }))
                    }
                    placeholder="Define how this agent structures arguments, what clichés to avoid, and its rhetorical style..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110] resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-[#57544E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPersona.is_public}
                    onChange={(e) =>
                      setNewPersona((p) => ({
                        ...p,
                        is_public: e.target.checked,
                      }))
                    }
                  />
                  <span>Share this persona with the Blogout community</span>
                </label>

                <button
                  type="submit"
                  disabled={creatingPersona}
                  className="w-full py-2.5 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider hover:bg-[#C83E2B] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingPersona ? "Saving Persona..." : "Save Custom Persona"}
                </button>
              </form>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsDrawerOpen(false)}
              className="mt-6 w-full py-2.5 border border-[#111110] text-xs font-mono-meta uppercase tracking-wider text-[#111110] hover:bg-[#F3EFEA] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}