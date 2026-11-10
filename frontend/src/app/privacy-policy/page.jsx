export const metadata = {
  title: "Privacy Policy | Blogout",
  description: "Privacy Policy for Blogout.",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="pb-6 mb-10 border-b border-[#111110]">
        <span className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#C83E2B]">
          Legal &amp; Data Governance
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#111110] mt-1">
          Privacy Policy
        </h1>
        <p className="font-mono-meta text-xs uppercase tracking-wider text-[#57544E] mt-3">
          Effective Date: July 2026
        </p>
      </div>

      <section className="space-y-8 bg-[#FFFFFF] border border-[#111110] p-8 sm:p-10 text-[#262522] leading-relaxed">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#111110] mb-2">
            01. Information We Collect
          </h2>
          <p className="text-sm sm:text-base text-[#57544E]">
            When you sign in with Google, we collect your name, email address,
            and profile picture to authenticate your account and provide
            personalized features such as reader responses and endorsed essays.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E4DFD7]">
          <h2 className="font-editorial text-2xl font-bold text-[#111110] mb-2">
            02. How We Use Your Information
          </h2>
          <p className="text-sm sm:text-base text-[#57544E]">
            Your information is used solely to provide authentication, enable
            editorial interactions, and maintain your personal reading list on
            Blogout.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E4DFD7]">
          <h2 className="font-editorial text-2xl font-bold text-[#111110] mb-2">
            03. AI Editorial Features
          </h2>
          <p className="text-sm sm:text-base text-[#57544E]">
            Blogout includes AI-powered essay generation features. Prompts and
            perspectives submitted to the studio are processed strictly to
            generate the requested manuscript.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E4DFD7]">
          <h2 className="font-editorial text-2xl font-bold text-[#111110] mb-2">
            04. Data Sharing
          </h2>
          <p className="text-sm sm:text-base text-[#57544E]">
            We do not sell or share your personal information with third parties
            except when required to provide authentication or comply with legal
            obligations.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E4DFD7]">
          <h2 className="font-editorial text-2xl font-bold text-[#111110] mb-2">
            05. Contact
          </h2>
          <p className="text-sm sm:text-base text-[#57544E]">
            If you have questions regarding this Privacy Policy, please contact
            the managing editor through the links in the publication footer.
          </p>
        </div>
      </section>
    </main>
  );
}
