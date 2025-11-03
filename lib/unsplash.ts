import type { UnsplashImage, UnsplashSearchResponse } from "@/types/unsplash";

const UNSPLASH_API_URL = "https://api.unsplash.com";
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("Warning: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is not set");
}

/**
 * Fetch random photos from Unsplash
 */
export async function fetchRandomPhotos(count: number = 24): Promise<UnsplashImage[]> {
  try {
    const response = await fetch(`${UNSPLASH_API_URL}/photos/random?count=${count}&client_id=${ACCESS_KEY}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching random photos:", error);
    throw error;
  }
}

/**
 * Fetch photos with pagination
 */
export async function fetchPhotos(page: number = 1, perPage: number = 24): Promise<UnsplashImage[]> {
  try {
    const response = await fetch(`${UNSPLASH_API_URL}/photos?page=${page}&per_page=${perPage}&client_id=${ACCESS_KEY}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }
}

/**
 * Search photos with query and pagination
 */
export async function searchPhotos(query: string, page: number = 1, perPage: number = 24): Promise<UnsplashSearchResponse> {
  try {
    if (!query.trim()) {
      // Return regular photos if no query
      const photos = await fetchPhotos(page, perPage);
      return {
        total: 10000,
        total_pages: 1000,
        results: photos,
      };
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${ACCESS_KEY}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching photos:", error);
    throw error;
  }
}

/**
 * Track photo download for Unsplash API guidelines
 */
export async function trackDownload(downloadLocation: string): Promise<void> {
  try {
    await fetch(`${downloadLocation}?client_id=${ACCESS_KEY}`);
  } catch (error) {
    console.error("Error tracking download:", error);
  }
}
