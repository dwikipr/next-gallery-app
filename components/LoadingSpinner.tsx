import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * LoadingSpinner component with optional message
 */
export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
