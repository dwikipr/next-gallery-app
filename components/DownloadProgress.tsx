'use client';

import { X } from 'lucide-react';

interface DownloadProgressProps {
  progress: number;
  fileName: string;
  onCancel: () => void;
}

/**
 * Download progress bar component
 * Shows download progress with percentage and cancel button
 */
export function DownloadProgress({
  progress,
  fileName,
  onCancel,
}: DownloadProgressProps) {
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            Downloading
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {fileName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Cancel download"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-right text-gray-600 dark:text-gray-400">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
