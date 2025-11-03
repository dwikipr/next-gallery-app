'use client';

import { Trash2 } from 'lucide-react';
import type { UnsplashImage } from '@/types/unsplash';

interface FavoriteCardProps {
  image: UnsplashImage;
  onRemove: (imageId: string) => void;
  onClick: () => void;
}

/**
 * FavoriteCard - Large card for favorites page matching reference design
 */
export function FavoriteCard({ image, onRemove, onClick }: FavoriteCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(image.id);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
      onClick={onClick}
    >
      {/* Large image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.urls.regular}
          alt={image.alt_description || image.description || 'Saved image'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info section */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1">Title</h3>
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-xs text-gray-400">Score: 61</p>
        </div>
        
        {/* Delete button */}
        <button
          onClick={handleRemove}
          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove from favorites"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
