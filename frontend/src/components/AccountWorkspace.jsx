"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FiPlus, FiTrash2, FiKey, FiCpu } from "react-icons/fi";
import { toast } from "sonner";
import PublishedBlogsTable from "./PublishedBlogsTable";
import LikedBlogsTable from "./LikedBlogsTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AccountWorkspace({
  isAdmin,
  myBlogs = [],
  likedBlogs = [],
}) {
  const { data: session } = useSession();

  const publishedList = myBlogs.filter((b) => b.published);
  const draftList = myBlogs.filter((b) => !b.published);

  const [activeTab, setActiveTab] = useState(
    isAdmin ? "published" : "reading-list"
  );

  const [personas, setPersonas] = useState([]);
  const [quota, setQuota] = useState(null);
  const [userGeminiKey, setUserGeminiKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: "",
    role_description: "",
    tone: "Analytical & Editorial",
    system_instructions: "",
    is_public: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserGeminiKey(
        window.localStorage.getItem("blogout_user_gemini_key") || ""
      );
    }
  }, []);

  const handleSaveKey = (val) => {
    setUserGeminiKey(val);
    if (typeof window !== "undefined") {
      if (val.trim()) {
        window.localStorage.setItem("blogout_user_gemini_key", val.trim());
      } else {
        window.localStorage.removeItem("blogout_user_gemini_key");
      }
    }
  };

  const loadAgentData = useCallback(async () => {
    if (!session?.id_token) return;
    try {
      const headers = { Authorization: `Bearer ${session.id_token}` };
      const [pRes, qRes] = await Promise.all([
        fetch(`${API_URL}/agent/personas`, { headers }),
        fetch(`${API_URL}/agent/quota`, { headers }),
      ]);
      if (pRes.ok) {
        const d = await pRes.json();
        setPersonas(d.personas || []);
      }
      if (qRes.ok) {
        setQuota(await qRes.json());
      }
    } catch (err) {
      console.error("Failed to load agent workspace data:", err);
    }
  }, [session?.id_token]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  const handleCreatePersona = async (e) => {
    e.preventDefault();
    if (!session?.id_token) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/agent/personas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.id_token}`,
        },
        body: JSON.stringify(newPersona),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to create persona");
      }
      toast.success("Custom agent persona saved.");
      setNewPersona({
        name: "",
        role_description: "",
        tone: "Analytical & Editorial",
        system_instructions: "",
        is_public: false,
      });
      loadAgentData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePersona = async (dbId) => {
    if (!session?.id_token) return;
    try {
      const res = await fetch(`${API_URL}/agent/personas/${dbId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.id_token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete persona");
      toast.success("Persona removed.");
      loadAgentData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const tabs = [
    ...(isAdmin
      ? [
          {
            id: "published",
            label: "Published Dispatches",
            count: publishedList.length,
          },
          {
            id: "drafts",
            label: "Drafts & Unlisted",
            count: draftList.length,
          },
        ]
      : []),
    {
      id: "reading-list",
      label: "Endorsed Reading List",
      count: likedBlogs.length,
    },
    {
      id: "agents",
      label: "AI Agents & Quota",
      count: personas.length,
    },
  ];

  return (
    <section className="mt-12">
      {/* Tab Bar */}
      <div className="flex flex-wrap items-center border-b border-[#111110] gap-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-xs font-mono-meta uppercase tracking-[0.14em] border-t border-x transition-colors cursor-pointer flex items-center gap-2 ${
                active
                  ? "border-[#111110] bg-[#111110] text-[#FAF8F5] font-semibold"
                  : "border-transparent bg-transparent text-[#57544E] hover:text-[#111110] hover:bg-[#F3EFEA]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-[#C83E2B] text-[#FAF8F5]"
                    : "bg-[#E4DFD7] text-[#111110]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-8">
        {activeTab === "published" && isAdmin && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                  Live Index
                </span>
                <h2 className="font-editorial text-3xl font-bold text-[#111110]">
                  Published Dispatches
                </h2>
              </div>
              <p className="text-xs font-mono-meta text-[#57544E]">
                Publicly visible essays across the archive.
              </p>
            </div>
            <PublishedBlogsTable blogs={publishedList} />
          </div>
        )}

        {activeTab === "drafts" && isAdmin && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                  Working Manuscripts
                </span>
                <h2 className="font-editorial text-3xl font-bold text-[#111110]">
                  Drafts &amp; Archived Dispatches
                </h2>
              </div>
              <p className="text-xs font-mono-meta text-[#57544E]">
                Unpublished manuscripts staged for editorial refinement.
              </p>
            </div>
            <PublishedBlogsTable blogs={draftList} />
          </div>
        )}

        {activeTab === "reading-list" && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
                  Personal Anthology
                </span>
                <h2 className="font-editorial text-3xl font-bold text-[#111110]">
                  Endorsed Reading List
                </h2>
              </div>
              <p className="text-xs font-mono-meta text-[#57544E]">
                Essays you have endorsed and saved for reference.
              </p>
            </div>
            <LikedBlogsTable blogs={likedBlogs} />
          </div>
        )}

        {activeTab === "agents" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Personas List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border border-[#111110] bg-[#FFFFFF] p-6">
                <div className="pb-4 mb-5 border-b border-[#E4DFD7] flex items-center justify-between">
                  <div>
                    <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#C83E2B]">
                      Editorial Roster
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-[#111110]">
                      Available Writer Personas
                    </h3>
                  </div>
                  <FiCpu className="text-[#111110]" size={20} />
                </div>

                <div className="divide-y divide-[#E4DFD7]">
                  {personas.map((p) => (
                    <div
                      key={p.id}
                      className="py-4 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-editorial text-lg font-bold text-[#111110]">
                            {p.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono-meta uppercase tracking-wider ${
                              p.builtin
                                ? "bg-[#F3EFEA] text-[#57544E] border border-[#E4DFD7]"
                                : "bg-[#C83E2B] text-[#FAF8F5]"
                            }`}
                          >
                            {p.builtin ? "Built-in" : "Custom"}
                          </span>
                          <span className="text-[11px] font-mono-meta text-[#85817A]">
                            Tone: {p.tone}
                          </span>
                        </div>
                        <p className="text-xs text-[#57544E]">
                          {p.role_description}
                        </p>
                        <p className="text-xs text-[#262522] bg-[#FAF8F5] border border-[#E4DFD7] p-2.5 mt-2 leading-relaxed">
                          {p.system_instructions}
                        </p>
                      </div>

                      {!p.builtin && p.is_owner && (
                        <button
                          type="button"
                          onClick={() => handleDeletePersona(p.db_id)}
                          className="p-2 border border-[#E4DFD7] text-[#85817A] hover:text-[#C83E2B] hover:border-[#C83E2B] transition-colors cursor-pointer"
                          title="Delete custom persona"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Quota Monitor + Create Custom Persona */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quota & BYOK Card */}
              <div className="border border-[#111110] bg-[#FFFFFF] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD7]">
                  <span className="font-mono-meta text-xs uppercase tracking-wider font-semibold text-[#111110] flex items-center gap-2">
                    <FiKey className="text-[#C83E2B]" />
                    <span>Free-Tier Rate-Limit &amp; Quota</span>
                  </span>
                  {quota && (
                    <span className="px-2 py-0.5 bg-[#F3EFEA] border border-[#111110] text-[11px] font-mono-meta text-[#111110]">
                      {quota.remaining}/{quota.daily_limit} Left Today
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#57544E] leading-relaxed">
                  Our shared <code className="font-mono-meta">gemini-2.5-flash</code> pool enforces a 10 RPM concurrency queue and {quota?.daily_limit || 5} daily generations per account. Supply your own Google AI Studio key below for unlimited generations.
                </p>

                <div>
                  <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1.5">
                    Personal Gemini API Key (BYOK)
                  </label>
                  <input
                    type="password"
                    value={userGeminiKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs font-mono-meta text-[#111110] focus:outline-none focus:border-[#C83E2B]"
                  />
                </div>
              </div>

              {/* Custom Persona Creator */}
              <form
                onSubmit={handleCreatePersona}
                className="border border-[#111110] bg-[#FFFFFF] p-6 space-y-4"
              >
                <div className="pb-3 border-b border-[#E4DFD7]">
                  <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[#C83E2B]">
                    Custom Agent Studio
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#111110]">
                    Define New Agent Persona
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
                    placeholder="e.g., Cultural Critic"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                      Role Description *
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
                      placeholder="Short role summary..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                      Tone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPersona.tone}
                      onChange={(e) =>
                        setNewPersona((p) => ({ ...p, tone: e.target.value }))
                      }
                      placeholder="e.g., Incisive & Literary"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-meta uppercase tracking-wider text-[#111110] mb-1">
                    System Directives *
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
                    placeholder="Specify rhetorical structure, pacing, and editorial rules..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#111110] text-xs text-[#111110] resize-none"
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
                  <span>Make available to other Blogout authors</span>
                </label>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#111110] text-[#FAF8F5] text-xs font-mono-meta uppercase tracking-wider hover:bg-[#C83E2B] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FiPlus size={14} />
                  <span>{creating ? "Creating..." : "Create Agent Persona"}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

