"use client";

import { useState, useEffect } from "react";
import { FavoriteCard } from "@/components/FavoriteCard";
import { DetailModal } from "@/components/DetailModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BottomNav } from "@/components/BottomNav";
import { useFavorites } from "@/hooks/useFavorites";

import type { UnsplashImage } from "@/types/unsplash";

/**
 * Favorites page displays all favorited images
 */
export default function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [favoriteImages, setFavoriteImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(
    null
  );
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
          const response = await fetch(
            `https://api.unsplash.com/photos/${fav.id}?client_id=${ACCESS_KEY}`
          );
          if (response.ok) {
            return await response.json();
          }
          return null;
        });

        const images = await Promise.all(imagePromises);
        setFavoriteImages(
          images.filter((img) => img !== null) as UnsplashImage[]
        );
      } catch (error) {
        console.error("Error fetching favorite images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteImages();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Save Image</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading favorites..." />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && favoriteImages.length === 0 && (
          <div className="text-center py-16 px-4">
            <h2 className="text-xl font-semibold mb-2">No saved images yet</h2>
            <p className="text-gray-600 mb-6">
              Tap the heart icon on images to save them here!
            </p>
          </div>
        )}

        {/* Favorites list - full width cards with spacing */}
        {!isLoading && favoriteImages.length > 0 && (
          <div className="space-y-4">
            {favoriteImages.map((image) => (
              <FavoriteCard
                key={image.id}
                image={image}
                onRemove={toggleFavorite}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedImage && (
        <DetailModal
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
