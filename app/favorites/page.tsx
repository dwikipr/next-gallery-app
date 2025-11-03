"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { ImageCard } from "@/components/ImageCard";
import { ImageModal } from "@/components/ImageModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useFavorites } from "@/hooks/useFavorites";
import type { UnsplashImage } from "@/types/unsplash";

/**
 * Favorites page displays all favorited images
 */
export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [favoriteImages, setFavoriteImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteImages = async () => {
      if (favorites.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

        const imagePromises = favorites.map(async (fav) => {
          const response = await fetch(`https://api.unsplash.com/photos/${fav.id}?client_id=${ACCESS_KEY}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        });

        const images = await Promise.all(imagePromises);
        setFavoriteImages(images.filter((img) => img !== null) as UnsplashImage[]);
      } catch (error) {
        console.error("Error fetching favorite images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteImages();
  }, [favorites]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Back to gallery"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 fill-red-500 text-red-500" />
              <h1 className="text-2xl font-semibold">My Favorites</h1>
            </div>
            {!isLoading && favoriteImages.length > 0 && (
              <span className="text-gray-500 dark:text-gray-400">
                ({favoriteImages.length} {favoriteImages.length === 1 ? "image" : "images"})
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {isLoading && <LoadingSpinner message="Loading favorites..." />}

        {/* Empty state */}
        {!isLoading && favoriteImages.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start favoriting images to see them here!</p>
            <button onClick={() => router.push("/")} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Browse Gallery
            </button>
          </div>
        )}

        {/* Favorites grid */}
        {!isLoading && favoriteImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {favoriteImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isFavorite={isFavorite(image.id)}
                onToggleFavorite={toggleFavorite}
                onClick={() => setSelectedImage(image)}
              />
            ))}
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
