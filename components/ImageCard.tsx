'use client';

import { useState } from 'react';
import { Heart, User } from 'lucide-react';
import type { UnsplashImage } from '@/types/unsplash';

interface ImageCardProps {
  image: UnsplashImage;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
  onClick: () => void;
}

/**
 * ImageCard displays a single image with favorite functionality
 * Includes hover effects and photographer attribution
 */
export function ImageCard({
  image,
  isFavorite,
  onToggleFavorite,
  onClick,
}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update
    setLocalIsFavorite(!localIsFavorite);
    onToggleFavorite(image.id);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${image.alt_description || 'image'} by ${image.user.name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.urls.small}
          alt={image.alt_description || image.description || 'Unsplash image'}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />

        {/* Loading placeholder */}
        {!isLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: image.color || '#e5e7eb' }}
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-1 right-1 p-1.5 md:p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            localIsFavorite ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100 focus:opacity-100'
          }`}
          aria-label={localIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
          type="button"
        >
          <Heart
            className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
              localIsFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          />
        </button>

        {/* Photographer info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            {image.user.profile_image?.small ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.user.profile_image.small}
                alt={image.user.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{image.user.name}</p>
              <p className="text-xs text-white/80 truncate">
                @{image.user.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
