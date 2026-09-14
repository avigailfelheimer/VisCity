import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { getMedia, uploadMedia, deleteMedia } from '../../api/mediaApi';
import { formatDate } from '../../utils/dateUtils';
import Lightbox from '../ui/Lightbox';

export default function PlaceMediaGrid({ placeId, initialMedia = [] }) {
  const { user } = useContext(UserContext);
  const [mediaList, setMediaList] = useState(initialMedia);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // טעינת המדיה הקיימת של המקום מהשרת
  useEffect(() => {
    let active = true;

    const fetchMedia = async () => {
      setLoading(true);
      try {
        const data = await getMedia(placeId);
        if (active) setMediaList(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError('שגיאה בטעינת המדיה. אנא נסו שוב.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (placeId) fetchMedia();
    return () => { active = false; };
  }, [placeId]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      setError('יש להתחבר כדי להעלות מדיה');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError('');

    try {
      // השרת מקבל קובץ אחד בכל בקשה (upload.single), כך שמעלים כל קובץ בנפרד
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const media = await uploadMedia(placeId, files[i], user.token);
        uploaded.push(media);
      }
      setMediaList((prev) => [...uploaded, ...prev]);
    } catch (err) {
      setError(err.message || 'העלאת הקבצים נכשלה');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const isOwnerOf = (item) => {
    if (!user) return false;
    const isAdmin = user.role === 'admin' || user.username === 'admin1';
    return isAdmin || (item.user_id != null && String(user.id) === String(item.user_id));
  };

  const handleDelete = async (item) => {
    if (!user) return;
    if (!window.confirm('למחוק את התמונה הזו?')) return;

    try {
      await deleteMedia(placeId, item.media_id, user.token);
      setMediaList((prev) => prev.filter((m) => m.media_id !== item.media_id));
      setLightboxIndex((prev) => {
        if (prev == null) return prev;
        const newLength = mediaList.length - 1;
        if (newLength <= 0) return null;
        return Math.min(prev, newLength - 1);
      });
    } catch (err) {
      alert('שגיאה במחיקה: ' + (err.message || err));
    }
  };

  // המרה לפורמט שה-Lightbox מצפה לו
  const lightboxItems = mediaList.map((item) => ({
    media_id: item.media_id,
    url: item.media_url,
    type: item.media_type === 'audio' ? 'audio' : 'image',
    alt: 'תמונה מהגלריה של המקום',
    uploadedBy: item.uploaded_by,
    uploadedAt: formatDate(item.uploaded_at),
  }));

  return (
    <section className="place-media-section">
      <h3>תמונות נוספות מהמקום</h3>

      {user ? (
        <div className="media-upload-zone">
          <label htmlFor="media-file-input" className="btn-secondary">
            {uploading ? 'מעלה קבצים...' : '📷 הוסף תמונות'}
          </label>
          <input
            id="media-file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <p className="no-media-text">יש להתחבר כדי להעלות תמונות למקום זה.</p>
      )}

      {error && <p className="modal-error-message">{error}</p>}

      {loading ? (
        <p className="no-media-text">טוען מדיה...</p>
      ) : mediaList.length === 0 ? (
        <p className="no-media-text">אין עדיין תמונות עבור מקום זה. היו הראשונים לשתף!</p>
      ) : (
        <div className="media-gallery-grid">
          {mediaList.map((item, idx) => (
            <div key={item.media_id} className="media-grid-item">
              {item.media_type === 'audio' ? (
                <audio src={item.media_url} controls />
              ) : (
                <>
                  <button
                    type="button"
                    className="media-grid-item__btn"
                    onClick={() => setLightboxIndex(idx)}
                    aria-label="הצג תמונה בגודל מלא"
                  >
                    <img src={item.media_url} alt="מדיה מהמקום" loading="lazy" />
                  </button>
                  <span className="media-grid-item__overlay" aria-hidden="true">🔍</span>
                </>
              )}

              {isOwnerOf(item) && (
                <button
                  type="button"
                  className="media-grid-item__delete"
                  onClick={() => handleDelete(item)}
                  aria-label="מחק תמונה"
                  title="מחק תמונה"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxIndex != null && (
        <Lightbox
          items={lightboxItems}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          renderExtra={(item) => {
            const mediaItem = mediaList.find((m) => m.media_id === item.media_id);
            if (mediaItem && isOwnerOf(mediaItem)) {
              return (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleDelete(mediaItem)}
                >
                  🗑 מחק תמונה
                </button>
              );
            }
            return null;
          }}
        />
      )}
    </section>
  );
}
