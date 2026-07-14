import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app-config";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable}`} style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {children}
    </div>
  );
}
