import { Gallery } from '@/components/Gallery';
import { fetchPhotos } from '@/lib/unsplash';

export default async function Home() {
  // SSR: Fetch initial photos on server
  const initialPhotos = await fetchPhotos(1, 24);
  
  return <Gallery initialPhotos={initialPhotos} />;
}
