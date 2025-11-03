'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Heart, Home } from 'lucide-react';

/**
 * Navigation component for switching between gallery and favorites
 */
export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push('/')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          pathname === '/'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Go to gallery"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Gallery</span>
      </button>
      <button
        onClick={() => router.push('/favorites')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          pathname === '/favorites'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Go to favorites"
      >
        <Heart className={`w-5 h-5 ${pathname === '/favorites' ? 'fill-current' : ''}`} />
        <span className="hidden sm:inline">Favorites</span>
      </button>
    </div>
  );
}
