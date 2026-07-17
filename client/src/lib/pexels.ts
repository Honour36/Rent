/**
 * Server-side Pexels helper.
 * PEXELS_API_KEY has no NEXT_PUBLIC_ prefix - it is ONLY available in
 * server components / route handlers and is never shipped to the browser.
 */

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
  avg_color: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

/**
 * Fetch photos from Pexels by query.
 * Must only be called from Server Components or Server Actions.
 */
export async function fetchPexelsPhotos(
  query: string,
  {
    perPage = 6,
    page = 1,
    orientation = "landscape",
  }: {
    perPage?: number;
    page?: number;
    orientation?: "landscape" | "portrait" | "square";
  } = {}
): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[pexels] PEXELS_API_KEY is not set - returning empty array.");
    return [];
  }

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("orientation", orientation);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      // Cache for 1 hour - avoids hammering the API on every page visit
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("[pexels] API error:", res.status, await res.text());
      return [];
    }

    const data: PexelsSearchResponse = await res.json();
    return data.photos ?? [];
  } catch (err) {
    console.error("[pexels] Fetch failed:", err);
    return [];
  }
}

/**
 * Fetch a curated selection of photos.
 */
export async function fetchCuratedPexelsPhotos(perPage = 6): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${perPage}`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data: PexelsSearchResponse = await res.json();
    return data.photos ?? [];
  } catch {
    return [];
  }
}
