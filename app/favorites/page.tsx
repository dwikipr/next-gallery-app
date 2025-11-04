'use client';

import { useState, useEffect } from 'react';
import { FavoriteCard } from '@/components/FavoriteCard';
import { DetailModal } from '@/components/DetailModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BottomNav } from '@/components/BottomNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSavedImages, deleteSavedImage } from '@/lib/api';
import type { SavedImage } from '@/types/api';

/**
 * Favorites page displays saved images from backend
 */
export default function FavoritesPage() {
  const { token } = useAuth();
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedImages = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const data = await fetchSavedImages(token);
        setSavedImages(data);
      } catch {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedImages();
  }, [token]);

  const handleRemove = async (savedImageId: string) => {
    if (!token) return;

    // Find the saved image to get the savedImageId
    const savedImage = savedImages.find((img) => img.publicImageId === savedImageId);
    if (!savedImage) return;

    try {
      // Optimistic update
      setSavedImages((prev) => prev.filter((img) => img.savedImageId !== savedImage.savedImageId));
      
      await deleteSavedImage(token, savedImage.savedImageId);
    } catch {
      // Revert on error
      if (token) {
        const data = await fetchSavedImages(token);
        setSavedImages(data);
      }
    }
  };

  const isFavorite = (imageId: string) => {
    return savedImages.some((img) => img.publicImageId === imageId);
  };

  const handleToggleFavorite = (imageId: string) => {
    handleRemove(imageId);
  };

  return (
    <ProtectedRoute>
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
              <LoadingSpinner message="Loading saved images..." />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && savedImages.length === 0 && (
            <div className="text-center py-16 px-4">
              <h2 className="text-xl font-semibold mb-2">No saved images yet</h2>
              <p className="text-gray-600 mb-6">
                Tap the heart icon on images to save them here!
              </p>
            </div>
          )}

          {/* Saved images list */}
          {!isLoading && savedImages.length > 0 && (
            <div className="space-y-4">
              {savedImages.map((image) => (
                <FavoriteCard
                  key={image.savedImageId}
                  image={{
                    id: image.publicImageId,
                    urls: {
                      small: image.imageUrl,
                      regular: image.imageUrl,
                      full: image.imageUrl,
                    },
                    alt_description: image.title,
                    description: image.description,
                    user: {
                      name: 'Unknown',
                      username: 'unknown',
                      profile_image: { small: '', medium: '' },
                      links: { html: '#' },
                      bio: '',
                      location: '',
                    },
                    width: 1000,
                    height: 1000,
                    likes: 0,
                    created_at: new Date().toISOString(),
                    color: '#cccccc',
                  }}
                  onRemove={handleRemove}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </main>

        {/* Detail modal */}
        {selectedImage && (
          <DetailModal
            image={{
              id: selectedImage.publicImageId,
              urls: {
                small: selectedImage.imageUrl,
                regular: selectedImage.imageUrl,
                full: selectedImage.imageUrl,
              },
              alt_description: selectedImage.title,
              description: selectedImage.description,
              user: {
                name: 'Unknown',
                username: 'unknown',
                profile_image: { small: '', medium: '' },
                links: { html: '#' },
                bio: '',
                location: '',
              },
              width: 1000,
              height: 1000,
              likes: 0,
              created_at: new Date().toISOString(),
              color: '#cccccc',
            }}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            isFavorite={isFavorite(selectedImage.publicImageId)}
            onToggleFavorite={handleToggleFavorite}
            showZoomAndDownload={false}
          />
        )}

        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
