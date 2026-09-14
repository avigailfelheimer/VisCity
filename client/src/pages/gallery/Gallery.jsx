import { useEffect, useState } from 'react';
import { getPlaces } from '../../api/placesApi';
import { getMedia } from '../../api/mediaApi';
import GalleryGrid from '../../components/gallery/GalleryGrid';
import '../../styles/pages/gallery.css';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const placesRes = await getPlaces({ page: 1, limit: 12 });
        const places = placesRes.places || [];

        const allMedia = [];
        await Promise.all(
          places.map(async (p) => {
            try {
              const items = await getMedia(p.place_id);
              (items || []).forEach((it) => allMedia.push({ ...it, placeId: p.place_id }));
            } catch {
              // התעלמות משגיאות במקום בודד
            }
          })
        );

        setMedia(allMedia);
      } catch {
        setMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="gallery-page">
      <h1 className="gallery-title">גלריית תמונות</h1>
      <p className="gallery-subtitle">תמונות ששותפו על ידי הקהילה שלנו • גלו השראה לטיול הבא שלכם</p>

      {loading ? (
        <div className="gallery-loading">
          <div className="places-spinner" />
          <span>טוען תמונות...</span>
        </div>
      ) : (
        <GalleryGrid media={media} />
      )}
    </div>
  );
}
