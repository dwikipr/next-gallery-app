import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { FavoriteImage } from '@/types/unsplash';

const FAVORITES_KEY = 'unsplash-gallery-favorites';

/**
 * Custom hook to manage favorite images
 * Persists favorites to localStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteImage[]>(
    FAVORITES_KEY,
    []
  );

  const isFavorite = useCallback(
    (imageId: string): boolean => {
      return favorites.some((fav) => fav.id === imageId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (imageId: string) => {
      setFavorites((prev) => {
        const exists = prev.some((fav) => fav.id === imageId);

        if (exists) {
          // Remove from favorites
          return prev.filter((fav) => fav.id !== imageId);
        } else {
          // Add to favorites
          return [...prev, { id: imageId, timestamp: Date.now() }];
        }
      });
    },
    [setFavorites]
  );

  const addFavorite = useCallback(
    (imageId: string) => {
      setFavorites((prev) => {
        if (prev.some((fav) => fav.id === imageId)) {
          return prev;
        }
        return [...prev, { id: imageId, timestamp: Date.now() }];
      });
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (imageId: string) => {
      setFavorites((prev) => prev.filter((fav) => fav.id !== imageId));
    },
    [setFavorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  };
}
