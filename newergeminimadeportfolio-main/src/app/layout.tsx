import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Raj Shah - AI & Full-Stack Engineer",
  description: "Portfolio of Raj Shah - Specializing in Next.js, Python, and scalable AI infrastructure.",
  keywords: ["AI Engineer", "Full-Stack Developer", "Next.js", "Python", "React", "TypeScript"],
  authors: [{ name: "Raj Shah" }],
  openGraph: {
    title: "Raj Shah - AI & Full-Stack Engineer",
    description: "Portfolio showcasing AI and full-stack engineering projects",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
