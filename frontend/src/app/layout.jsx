import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "./providers/SessionProvider";
import { Toaster } from "sonner";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-editorial-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-editorial-mono",
});

export const metadata = {
  title: "Blogout — Independent Editorial & AI Publishing Engine",
  description:
    "An editorial publication and AI-assisted writing studio for essays, perspectives, and long-form analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className={`${jakarta.className} antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#111110]`}>
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <Toaster position="bottom-right" richColors closeButton />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
