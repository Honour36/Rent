import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app-config";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={montserrat.variable}
      style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", scrollbarWidth: "none" }}
    >
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; }
      `}</style>
      {children}
    </div>
  );
}
