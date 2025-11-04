'use client';

import { useState, useEffect } from 'react';
import { ImageCard } from './ImageCard';
import { DetailModal } from './DetailModal';
import { SearchBar } from './SearchBar';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchImages, fetchSavedImages, saveImage, deleteSavedImage } from '@/lib/api';
import type { PublicImage, SavedImage } from '@/types/api';

/**
 * Gallery component using backend API
 */
export function GalleryNew() {
  const { token } = useAuth();
  const [images, setImages] = useState<PublicImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<PublicImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PublicImage | null>(null);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [savedImageIds, setSavedImageIds] = useState<Set<string>>(new Set());

  // Fetch images from backend
  useEffect(() => {
    const loadImages = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchImages(token);
        setImages(data);
        setFilteredImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [token]);

  // Filter images based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredImages(images);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = images.filter(
      (img) =>
        img.title.toLowerCase().includes(query) ||
        img.description.toLowerCase().includes(query)
    );
    setFilteredImages(filtered);
  }, [searchQuery, images]);

  // Load saved images from backend
  useEffect(() => {
    const loadSavedImages = async () => {
      if (!token) return;

      try {
        const data = await fetchSavedImages(token);
        setSavedImages(data);
        setSavedImageIds(new Set(data.map((img) => img.publicImageId)));
      } catch (error) {
        console.error('Error loading saved images:', error);
      }
    };

    loadSavedImages();
  }, [token]);

  const handleToggleFavorite = async (imageId: string) => {
    if (!token) return;

    const isSaved = savedImageIds.has(imageId);

    // Optimistic update
    setSavedImageIds((prev) => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });

    try {
      if (isSaved) {
        // Find and delete
        const savedImage = savedImages.find((img) => img.publicImageId === imageId);
        if (savedImage) {
          await deleteSavedImage(token, savedImage.savedImageId);
          setSavedImages((prev) => prev.filter((img) => img.savedImageId !== savedImage.savedImageId));
        }
      } else {
        // Save new
        const newSaved = await saveImage(token, { publicImageId: imageId });
        setSavedImages((prev) => [...prev, newSaved]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setSavedImageIds((prev) => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.add(imageId);
        } else {
          newSet.delete(imageId);
        }
        return newSet;
      });
    }
  };

  const handleRetry = () => {
    if (token) {
      fetchImages(token)
        .then((data) => {
          setImages(data);
          setFilteredImages(data);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load images');
        });
    }
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
        {!isLoading && !error && filteredImages.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.publicImageId}
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
                isFavorite={savedImageIds.has(image.publicImageId)}
                onToggleFavorite={handleToggleFavorite}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No images found. Try a different search term.' : 'No images available.'}
            </p>
          </div>
        )}
      </main>

      {/* Detail modal with zoom and download */}
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
          isFavorite={savedImageIds.has(selectedImage.publicImageId)}
          onToggleFavorite={handleToggleFavorite}
          showZoomAndDownload={true}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
