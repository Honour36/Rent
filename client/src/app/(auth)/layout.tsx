import type { ReactNode } from "react";
import Link from "next/link";
import { fetchPexelsPhotos } from "@/lib/pexels";
import { Logo } from "@/components/logo";
import { AuthSlideshow } from "./_components/auth-slideshow";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const photos = await fetchPexelsPhotos(
    "luxury modern apartment building architecture",
    { perPage: 8, orientation: "portrait" }
  );

  const slides = photos.map((p) => ({
    src: p.src.large2x,
    alt: p.alt || "Modern property",
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left: form panel ── */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        {/* Logo */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center group">
            <Logo height={20} />
          </Link>
        </div>

        {/* Page content */}
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

      {/* ── Right: slideshow panel (hidden on mobile) ── */}
      <div className="relative hidden lg:block lg:w-1/2">
        {slides.length > 0 ? (
          <AuthSlideshow photos={slides} interval={5000} />
        ) : (
          /* Fallback gradient if Pexels is unavailable */
          <div className="h-full bg-gradient-to-br from-[#1a56db] to-[#0f172a] flex items-end p-10">
            <blockquote className="text-white">
              <p className="text-xl font-bold leading-snug mb-3">
                "The spreadsheet-free way to manage your portfolio."
              </p>
              <p className="text-sm text-white/70">
                Rental - built for Zimbabwean property managers
              </p>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}
