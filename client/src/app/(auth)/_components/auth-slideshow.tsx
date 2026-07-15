"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SlidePhoto {
  src: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface AuthSlideshowProps {
  photos: SlidePhoto[];
  interval?: number; // ms between slides, default 5000
}

export function AuthSlideshow({ photos, interval = 5000 }: AuthSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setPrev(current);
      setAnimating(true);
      setCurrent((c) => (c + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [current, photos.length, interval]);

  // After the fade-in finishes, clear the previous slide
  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 700); // matches CSS transition duration
    return () => clearTimeout(t);
  }, [animating]);

  if (!photos.length) return null;

  const photo = photos[current];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Previous slide — fades out */}
      {prev !== null && (
        <div
          key={`prev-${prev}`}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0"
        >
          <Image
            src={photos[prev].src}
            alt={photos[prev].alt}
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      )}

      {/* Current slide — fades in */}
      <div
        key={`curr-${current}`}
        className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover"
          sizes="50vw"
          priority={current === 0}
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a56db]/50 via-transparent to-[#0f172a]/80 pointer-events-none" />

      {/* Bottom quote */}
      <div className="absolute bottom-0 left-0 right-0 p-10 pointer-events-none">
        <blockquote className="text-white">
          <p className="text-xl font-bold leading-snug mb-3">
            "The spreadsheet-free way to manage your portfolio."
          </p>
          <p className="text-sm text-white/70">
            Rental — built for Zimbabwean property managers
          </p>
        </blockquote>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-1.5 pointer-events-none">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo credit */}
      <p className="absolute top-4 right-4 text-[10px] text-white/40 pointer-events-none">
        Photo by{" "}
        <a
          href={photo.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline pointer-events-auto hover:text-white/60"
        >
          {photo.photographer}
        </a>{" "}
        on Pexels
      </p>
    </div>
  );
}
