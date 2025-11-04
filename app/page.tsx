import { GalleryNew } from '@/components/GalleryNew';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <GalleryNew />
    </ProtectedRoute>
  );
}
