import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { getPlaceById } from '../../api/placesApi'; // ייבוא הפונקציה מה-API
import PlaceInfo from '../../components/places/PlaceInfo';
import PlaceMediaGrid from '../../components/media/PlaceMediaGrid';
import ReviewModal from '../../components/reviews/ReviewModal';
import PlaceMap from '../../components/places/PlaceMap';
import '../../styles/pages/places.css';

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchPlaceData = async () => {
    try {
      setLoading(true);
      // שימוש בפונקציה מקובץ ה-API (placesApi) שמפנה לכתובת השרת המוגדרת ב-config/env
      const data = await getPlaceById(id);
      setPlace(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPlaceData();
  }, [id]);

  if (loading) return <div className="loading-spinner">טוען נתונים...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!place) return <div className="error-message">המקום לא נמצא</div>;

  return (
    <div className="place-detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        חזרה לעמוד הקודם
      </button>

      <div className="place-detail-layout">
        {/* חלק 1: פרטי המקום הבסיסיים */}
        <PlaceInfo
          place={place}
          onPlaceDeleted={() => navigate('/places')}
          onPlaceUpdated={fetchPlaceData}
        />

        <PlaceMap
          lat={place.latitude}
          lng={place.longitude}
        />

        {/* חלק 2: כפתורי פעולה אינטראקטיביים */}
        <div className="place-actions-bar">
          <button className="btn-reviews" onClick={() => setIsReviewOpen(true)}>
            💬 תגובות וחוות דעת
            {place.review_count > 0 && (
              <span className="btn-reviews__count">{place.review_count}</span>
            )}
          </button>
        </div>

        {/* חלק 3: גלריית המדיה */}
        <PlaceMediaGrid placeId={id} initialMedia={place.media || []} />
      </div>

      {/* מודל הביקורות */}
      {isReviewOpen && (
        <ReviewModal
          placeId={id}
          placeName={place.name}
          placeOwnerId={place.created_by}
          onClose={() => setIsReviewOpen(false)}
        />
      )}
    </div>
  );
}
