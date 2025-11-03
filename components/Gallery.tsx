"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageCard } from "./ImageCard";
import { ImageModal } from "./ImageModal";
import { SearchBar } from "./SearchBar";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { BottomNav } from "./BottomNav";
import { useDebounce } from "@/hooks/useDebounce";
import { useFavorites } from "@/hooks/useFavorites";
import { searchPhotos } from "@/lib/unsplash";
import type { UnsplashImage } from "@/types/unsplash";
import { Loader2 } from "lucide-react";

interface GalleryProps {
  initialPhotos?: UnsplashImage[];
}

/**
 * Main Gallery component
 * Manages image fetching, search, pagination, and modal state
 * Supports SSR with initial photos
 */
export function Gallery({ initialPhotos = [] }: GalleryProps) {
  const [images, setImages] = useState<UnsplashImage[]>(initialPhotos);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(
    null
  );

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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load images. Please check your API key and try again."
        );
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
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 500 &&
        !isLoadingMore &&
        !isLoading &&
        hasMore
      ) {
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-1 py-2">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading images..." />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {/* Images grid - 3 columns matching reference design */}
        {!isLoading && !error && images.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-1">
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
            {!hasMore && images.length > 0 && (
              <p className="text-center text-gray-500 py-8">
                No more images to load
              </p>
            )}
          </>
        )}

        {/* No results */}
        {!isLoading && !error && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No images found. Try a different search term.
            </p>
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

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
