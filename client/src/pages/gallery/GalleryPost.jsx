import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { getMedia, deleteMedia } from '../../api/mediaApi';
import { formatDate } from '../../utils/dateUtils';
import Lightbox from '../../components/ui/Lightbox';
import '../../styles/pages/gallery.css';

export default function GalleryPost() {
  const { placeId, mediaId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const list = await getMedia(placeId);
        const found = (list || []).find((i) => String(i.media_id || i.id) === String(mediaId));
        setItem(found || null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [placeId, mediaId]);

  const handleDelete = async () => {
    if (!user || !item) return;
    if (!window.confirm('למחוק את התמונה הזו מהגלריה?')) return;

    setDeleting(true);
    try {
      await deleteMedia(placeId, item.media_id || item.id, user.token);
      alert('התמונה נמחקה בהצלחה');
      navigate('/gallery');
    } catch (err) {
      alert('שגיאה במחיקה: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = Boolean(user && item && item.user_id != null && user.id === item.user_id);

  if (loading) {
    return (
      <div className="post-loading-page">
        <div className="places-spinner" />
        <p>טוען פוסט...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="post-not-found-page">
        <p>הפוסט לא נמצא.</p>
        <Link to="/gallery" className="btn-secondary">
          חזרה לגלריה
        </Link>
      </div>
    );
  }

  const imgUrl = item.media_url || item.url;
  const uploader = item.uploaded_by || item.username || 'משתמש';
  const uploadDate = formatDate(item.uploaded_at);

  return (
    <div className="gallery-post-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        חזרה
      </button>

      <div className="post-container">
        <div className="post-image-wrapper" onClick={() => setLightboxOpen(true)}>
          <img
            src={imgUrl}
            alt={item.caption || 'תמונה מהגלריה'}
            className="post-main-image"
          />
        </div>

        <div className="post-details">
          <h1 className="post-title">{item.caption || 'פוסט מהגלריה'}</h1>

          <div className="post-meta">
            צולם / הועלה על ידי <strong>{uploader}</strong>
            {uploadDate && (
              <span className="post-date">
                • {uploadDate}
              </span>
            )}
          </div>

          <div className="post-actions">
            <Link to={`/places/${placeId}`} className="btn-primary">
              צפה בפרטי המקום
            </Link>
            <Link to="/gallery" className="btn-secondary">
              חזרה לגלריה
            </Link>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting ? 'מוחק...' : 'מחק תמונה'}
              </button>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          items={[{
            url: imgUrl,
            type: item.media_type === 'audio' ? 'audio' : 'image',
            alt: item.caption || 'תמונה מהגלריה',
            caption: item.caption || '',
            uploadedBy: uploader,
            uploadedAt: uploadDate,
          }]}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
