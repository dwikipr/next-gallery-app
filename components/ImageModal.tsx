"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  Heart,
  Download,
  MapPin,
  Calendar,
  ThumbsUp,
  ZoomIn,
  ZoomOut,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { UnsplashImage } from "@/types/unsplash";
import { DownloadProgress } from "./DownloadProgress";

interface ImageModalProps {
  image: UnsplashImage;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
}

/**
 * ImageModal displays full-resolution image with zoom capabilities
 * Supports pinch/scroll zoom, keyboard navigation, and detailed metadata
 */
export function ImageModal({
  image,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImageId, setCurrentImageId] = useState(image.id);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset zoom when image changes
  if (currentImageId !== image.id) {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentImageId(image.id);
  }

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      e.stopPropagation();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.stopPropagation();
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    } else if (scale > 1 && e.touches.length === 1) {
      // Pan when zoomed
      e.stopPropagation();
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      e.stopPropagation();
      const distance = getDistance(e.touches[0], e.touches[1]);

      if (lastPinchDistance > 0) {
        const delta = distance - lastPinchDistance;
        const zoomDelta = delta * 0.01;
        setScale((prev) => Math.max(1, Math.min(4, prev + zoomDelta)));
      }

      setLastPinchDistance(distance);
    } else if (isDragging && scale > 1 && e.touches.length === 1) {
      // Pan when zoomed
      e.stopPropagation();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastPinchDistance(0);
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);

      // Create abort controller for cancellation
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(image.urls.full, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      // Get total size
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      // Read the response as a stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Update progress
        if (total > 0) {
          const progress = (receivedLength / total) * 100;
          setDownloadProgress(progress);
        }
      }

      // Combine chunks into single array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Create blob and download
      const blob = new Blob([chunksAll], { type: "image/jpeg" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unsplash-${image.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Reset progress after a short delay
      setTimeout(() => {
        setDownloadProgress(null);
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        // Download cancelled by user
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content wrapper */}
      <div
        className="w-full h-full flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden relative">
          <div
            ref={imageRef}
            className={`relative select-none ${
              scale > 1 ? "cursor-move" : "cursor-default"
            }`}
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
              alt={image.alt_description || image.description || "Image"}
              className="max-w-full max-h-[70vh] md:max-h-[85vh] lg:max-h-[90vh] object-contain"
              style={{
                transform: `scale(${scale}) translate(${
                  position.x / scale
                }px, ${position.y / scale}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            />
          </div>

          {/* Zoom controls - positioned at bottom of image container */}
          <div className="absolute bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/60/70 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/10">
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
        </div>

        {/* Sidebar with details - Desktop: fixed sidebar, Mobile: collapsible bottom sheet */}
        <div className="lg:w-80 xl:w-96 bg-white lg:p-4 xl:p-6 overflow-y-auto">
          {/* Mobile: Collapsible header */}
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="lg:hidden w-full flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10"
            aria-label={isDetailsOpen ? "Hide details" : "Show details"}
          >
            <h2 className="text-lg font-semibold">Image Details</h2>
            {isDetailsOpen ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronUp className="w-6 h-6" />
            )}
          </button>

          {/* Desktop: Always visible title */}
          <h2
            id="modal-title"
            className="hidden lg:block text-2xl font-semibold mb-4"
          >
            Image Details
          </h2>

          {/* Collapsible content */}
          <div
            className={`${
              isDetailsOpen ? "block" : "hidden"
            } lg:block p-4 lg:p-0`}
          >
            {/* Photographer */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                PHOTOGRAPHER
              </h3>
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
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{image.user.name}</p>
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
                <p className="mt-2 text-sm text-gray-600">{image.user.bio}</p>
              )}
            </div>

            {/* Description */}
            {(image.description || image.alt_description) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  DESCRIPTION
                </h3>
                <p className="text-sm">
                  {image.description || image.alt_description}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                METADATA
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Published {formatDate(image.created_at)}</span>
              </div>
              {image.user.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{image.user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <ThumbsUp className="w-4 h-4 text-gray-500" />
                <span>{image.likes.toLocaleString()} likes</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Dimensions: {image.width} × {image.height}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorite(image.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isFavorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 hover:bg-gray-300:bg-gray-700"
                }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                aria-label="Download image"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>

            {/* Link to Unsplash */}
            <a
              href={image?.links?.html || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center text-sm text-blue-500 hover:underline"
            >
              View on Unsplash
            </a>
          </div>
        </div>
      </div>

      {/* Download Progress */}
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
