'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Download } from 'lucide-react';
import type { UnsplashImage } from '@/types/unsplash';
import { DownloadProgress } from './DownloadProgress';

interface DetailModalProps {
  image: UnsplashImage;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
  showZoomAndDownload?: boolean;
}

/**
 * DetailModal - Simplified detail view matching reference design
 * With optional zoom and download functionality for gallery
 */
export function DetailModal({
  image,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  showZoomAndDownload = false,
}: DetailModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!showZoomAndDownload) return;
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setScale((prev) => Math.min(Math.max(prev + delta * 0.5, 1), 4));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showZoomAndDownload || scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showZoomAndDownload || !isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showZoomAndDownload) return;

    if (e.touches.length === 2) {
      // Two finger pinch
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && scale > 1) {
      // Single finger pan (only when zoomed)
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!showZoomAndDownload) return;

    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      
      if (lastPinchDistance > 0) {
        const delta = distance - lastPinchDistance;
        const scaleChange = delta * 0.01;
        setScale((prev) => Math.min(Math.max(prev + scaleChange, 1), 4));
      }
      
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!showZoomAndDownload) return;

    if (e.touches.length < 2) {
      setLastPinchDistance(0);
    }
    
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  const handleDownload = async () => {
    try {
      abortControllerRef.current = new AbortController();
      setDownloadProgress(0);

      const response = await fetch(image.urls.full, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Download failed');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (total > 0) {
          setDownloadProgress((receivedLength / total) * 100);
        }
      }

      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([chunksAll], { type: 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `unsplash-${image.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => setDownloadProgress(null), 1000);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Download cancelled');
      } else {
        console.error('Error downloading image:', error);
      }
      setDownloadProgress(null);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setDownloadProgress(null);
    }
  };

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
      <div 
        ref={imageContainerRef}
        className="relative overflow-hidden bg-black"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.urls.regular}
          alt={image.alt_description || image.description || 'Image'}
          className="w-full object-cover max-h-[50vh]"
          style={
            showZoomAndDownload
              ? {
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  cursor: scale > 1 ? 'move' : 'default',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }
              : undefined
          }
        />
        
        {/* Zoom controls - only show for gallery */}
        {showZoomAndDownload && (
          <div className="absolute bottom-4 left-4 flex gap-2 bg-black/60 backdrop-blur-md rounded-full p-2 shadow-lg">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 text-white text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Credit and action buttons overlay */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {showZoomAndDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg hover:bg-blue-700"
              aria-label="Download image"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
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

        {!showZoomAndDownload && (
          <div className="absolute bottom-4 left-4">
            <p className="text-white text-sm font-medium drop-shadow-lg">
              Credit: Gift from Mr. {image.user.name}
            </p>
          </div>
        )}
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

      {/* Download progress */}
      {downloadProgress !== null && (
        <DownloadProgress
          progress={downloadProgress}
          fileName={`unsplash-${image.id}.jpg`}
          onCancel={handleCancelDownload}
        />
      )}
    </div>
  );
}
