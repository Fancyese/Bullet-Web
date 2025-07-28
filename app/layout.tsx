import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Bullet Journal App",
  description: "A simple, elegant Bullet Journal built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fefefe] text-[#333] min-h-screen flex flex-col`}
      >
        <header className="border-b border-gray-300 p-4 sticky top-0 bg-white z-10 shadow-sm flex justify-between items-center">
          <h1 className="font-semibold text-xl select-none">Bullet Journal</h1>
          <nav className="flex gap-3 text-sm font-medium">
            <a href="/login" className="hover:underline focus:outline-none focus:ring">
              登录
            </a>
            <a href="/tasks" className="hover:underline focus:outline-none focus:ring">
              任务
            </a>
            <a href="/projects" className="hover:underline focus:outline-none focus:ring">
              项目
            </a>
          </nav>
        </header>

        <main className="flex-grow max-w-4xl mx-auto w-full p-6">{children}</main>

        <footer className="border-t border-gray-300 p-4 text-center text-sm text-gray-500">
          © 2025 Bullet Journal App
        </footer>
      </body>
    </html>
  );
}
