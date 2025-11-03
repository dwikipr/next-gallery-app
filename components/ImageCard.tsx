"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { UnsplashImage } from "@/types/unsplash";

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(image.id);
  };

  return (
    <div
      className="group relative overflow-hidden bg-gray-200 cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${image.alt_description || "image"} by ${
        image.user.name
      }`}
      suppressHydrationWarning
    >
      {/* Image - perfectly square */}
      <div className="relative w-full aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.urls.small}
          alt={image.alt_description || image.description || "Unsplash image"}
          className={`w-full h-full object-cover ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />

        {/* Loading placeholder */}
        {!isLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: image.color || "#e5e7eb" }}
          />
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* Favorite button - always visible when favorited */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isFavorite
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 focus:opacity-100"
          }`}
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          type="button"
          suppressHydrationWarning
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-700"
            }`}
            suppressHydrationWarning
          />
        </button>
      </div>
    </div>
  );
}
