import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import Lightbox from '../ui/Lightbox';

export default function GalleryGrid({ media }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!media || media.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="empty-icon">📷</div>
        <p>עדיין אין תמונות בגלריה. היו הראשונים להוסיף!</p>
      </div>
    );
  }

  const lightboxItems = media.map((m) => ({
    media_id: m.media_id || m.id,
    placeId: m.placeId,
    url: m.media_url || m.url,
    type: m.media_type === 'audio' ? 'audio' : 'image',
    alt: m.caption || m.uploaded_by || 'תמונה מהגלריה',
    caption: m.caption || '',
    uploadedBy: m.uploaded_by || '',
    uploadedAt: formatDate(m.uploaded_at),
  }));

  return (
    <>
      <div className="gallery-grid">
        {media.map((m, idx) => {
          const mid = m.media_id || m.id;
          return (
            <button
              type="button"
              key={`${m.placeId}-${mid}`}
              className="gallery-item"
              onClick={() => setActiveIndex(idx)}
              aria-label="הצג תמונה בגודל מלא"
            >
              <img src={m.media_url || m.url} alt={m.caption || m.uploaded_by || 'תמונה מהגלריה'} loading="lazy" />
              <span className="gallery-item__zoom" aria-hidden="true">🔍</span>
              {(m.uploaded_by || m.caption) && (
                <span className="gallery-item__info">
                  <span className="gallery-item__uploader">
                    {m.uploaded_by ? `צולם על ידי ${m.uploaded_by}` : ''}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeIndex != null && (
        <Lightbox
          items={lightboxItems}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          renderExtra={(item) => (
            <Link to={`/places/${item.placeId}`} className="btn-secondary" onClick={() => setActiveIndex(null)}>
              📍 צפה במקום
            </Link>
          )}
        />
      )}
    </>
  );
}
