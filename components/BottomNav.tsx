'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Bookmark } from 'lucide-react';

/**
 * Bottom navigation bar - matches reference design with red background
 */
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-red-700 text-white shadow-lg z-40">
      <div className="max-w-screen-xl mx-auto flex items-center justify-around py-3">
        <button
          onClick={() => router.push('/')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            pathname === '/' ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
          aria-label="Go to gallery"
        >
          <Home className="w-6 h-6" strokeWidth={pathname === '/' ? 2.5 : 2} />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button
          onClick={() => router.push('/favorites')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            pathname === '/favorites' ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
          aria-label="Go to favorites"
        >
          <Bookmark className={`w-6 h-6 ${pathname === '/favorites' ? 'fill-current' : ''}`} strokeWidth={pathname === '/favorites' ? 2.5 : 2} />
          <span className="text-xs font-medium">Save</span>
        </button>
      </div>
    </nav>
  );
}
