export const metadata = {
  title: "Privacy Policy | Blogout",
  description: "Privacy Policy for Blogout.",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>

      <p className="text-gray-700 mb-6">Effective Date: July 2026</p>

      <section className="space-y-6 text-gray-700 leading-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>
          <p>
            When you sign in with Google, we may collect your name, email
            address, and profile picture to authenticate your account and
            provide personalized features such as comments and liked blogs.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            How We Use Your Information
          </h2>
          <p>
            Your information is used solely to provide authentication, enable
            blog interactions, and improve your experience on Blogout.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">AI Features</h2>
          <p>
            Blogout includes AI-powered blog generation features. User prompts
            submitted to these features are processed only to generate the
            requested content.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Data Sharing</h2>
          <p>
            We do not sell or share your personal information with third parties
            except when required to provide authentication or comply with legal
            obligations.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contact</h2>
          <p>
            If you have any questions regarding this Privacy Policy, please
            contact the project owner through the available contact methods.
          </p>
        </div>
      </section>
    </main>
  );
}
