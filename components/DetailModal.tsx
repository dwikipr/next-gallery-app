'use client';

import { ArrowLeft } from 'lucide-react';
import type { UnsplashImage } from '@/types/unsplash';

interface DetailModalProps {
  image: UnsplashImage;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
}

/**
 * DetailModal - Simplified detail view matching reference design
 */
export function DetailModal({
  image,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-semibold">Detail</h1>
        </div>
      </header>

      {/* Image */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.urls.regular}
          alt={image.alt_description || image.description || 'Image'}
          className="w-full object-cover max-h-[50vh]"
        />
        
        {/* Credit and Save button overlay */}
        <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-between">
          <p className="text-white text-sm font-medium drop-shadow-lg">
            Credit: Gift from Mr. {image.user.name}
          </p>
          <button
            onClick={() => onToggleFavorite(image.id)}
            className={`px-4 py-2 rounded-full font-medium transition-colors shadow-lg ${
              isFavorite
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content sections */}
      <div className="px-4 py-6 space-y-6">
        {/* Description */}
        <section>
          <h2 className="font-semibold text-base mb-2">Description</h2>
          <p className="text-gray-500 text-sm">
            {image.description || image.alt_description || 'Lorem ipsum dolor sit amet...'}
          </p>
        </section>

        {/* Provenance Text */}
        <section>
          <h2 className="font-semibold text-base mb-2">Provenance Text</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet...
          </p>
        </section>

        {/* Publication History */}
        <section>
          <h2 className="font-semibold text-base mb-2">Publication History</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet...
          </p>
        </section>

        {/* Exhibition History */}
        <section>
          <h2 className="font-semibold text-base mb-2">Exhibition History</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet...
          </p>
        </section>

        {/* Photographer info */}
        <section className="pt-4 border-t border-gray-200">
          <h2 className="font-semibold text-base mb-2">Photographer</h2>
          <div className="flex items-center gap-3">
            {image.user.profile_image?.medium ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.user.profile_image.medium}
                alt={image.user.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {image.user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{image.user.name}</p>
              <a
                href={image.user.links.html}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                @{image.user.username}
              </a>
            </div>
          </div>
          {image.user.bio && (
            <p className="mt-3 text-sm text-gray-600">{image.user.bio}</p>
          )}
        </section>

        {/* Image stats */}
        <section className="text-sm text-gray-500 space-y-1">
          <p>Published: {new Date(image.created_at).toLocaleDateString()}</p>
          <p>Likes: {image.likes.toLocaleString()}</p>
          <p>Dimensions: {image.width} × {image.height}</p>
        </section>
      </div>

      {/* Bottom padding for safe area */}
      <div className="h-20" />
    </div>
  );
}
