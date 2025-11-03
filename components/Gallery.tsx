"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageCard } from "./ImageCard";
import { ImageModal } from "./ImageModal";
import { SearchBar } from "./SearchBar";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Navigation } from "./Navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useFavorites } from "@/hooks/useFavorites";
import { searchPhotos } from "@/lib/unsplash";
import type { UnsplashImage } from "@/types/unsplash";
import { Loader2 } from "lucide-react";

/**
 * Main Gallery component
 * Manages image fetching, search, pagination, and modal state
 */
export function Gallery() {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch images when search query or page changes
  const fetchImages = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const response = await searchPhotos(debouncedSearchQuery, pageNum, 24);

        if (isNewSearch) {
          setImages(response.results);
        } else {
          setImages((prev) => [...prev, ...response.results]);
        }

        setHasMore(pageNum < response.total_pages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images. Please check your API key and try again.");
        if (isNewSearch) {
          setImages([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearchQuery]
  );

  // Initial load and search query changes
  useEffect(() => {
    setPage(1);
    fetchImages(1, true);
  }, [debouncedSearchQuery, fetchImages]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 && !isLoadingMore && !isLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, isLoading, hasMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchImages(page, false);
    }
  }, [page, fetchImages]);

  const handleRetry = () => {
    setPage(1);
    fetchImages(1, true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Personal Gallery</h1>
            <Navigation />
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for photos..." />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {isLoading && <LoadingSpinner message="Loading images..." />}

        {/* Error state */}
        {error && !isLoading && <ErrorMessage message={error} onRetry={handleRetry} />}

        {/* Images grid */}
        {!isLoading && !error && images.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  isFavorite={isFavorite(image.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>

            {/* Load more indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {/* End of results */}
            {!hasMore && images.length > 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No more images to load</p>}
          </>
        )}

        {/* No results */}
        {!isLoading && !error && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No images found. Try a different search term.</p>
          </div>
        )}
      </main>

      {/* Image modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          isFavorite={isFavorite(selectedImage.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
