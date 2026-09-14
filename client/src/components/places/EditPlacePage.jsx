import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { getPlaceById } from '../../api/placesApi';
import AddPlaceModal from '../../components/places/AddPlaceModal';
import '../../styles/pages/places.css';

/**
 * EditPlacePage – עמוד עצמאי לעריכת מקום.
 * נפתח בטאב חדש מ-PlaceOwnerActions.
 * 
 * נתיב (route): /places/:id/edit
 * 
 * לאחר שמירה מוצלחת – מציג הודעת הצלחה וסוגר את הטאב.
 */
export default function EditPlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [place,   setPlace]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlaceById(id);
        setPlace(data);
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="places-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="places-loading">
          <div className="places-spinner" />
          <span>טוען נתונים...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="places-page">
        <div className="places-error">{error}</div>
        <button className="btn-secondary" onClick={() => window.close()}>סגור</button>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="places-page">
        <div className="error-message">המקום לא נמצא</div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="places-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>השינויים נשמרו בהצלחה!</h2>
        <p style={{ color: 'var(--places-text-muted)', marginBottom: '1.5rem' }}>
          ניתן לסגור חלון זה ולחזור לרשימה.
        </p>
        <button className="btn-secondary" onClick={() => window.close()}>סגור חלון</button>
      </div>
    );
  }

  return (
    <div className="places-page" style={{ minHeight: '100vh' }}>
      {/* פס עליון */}
      <div style={{
        background: '#1D9E75',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        fontSize: '0.85rem',
        textAlign: 'center',
        borderRadius: '0 0 12px 12px',
        marginBottom: '2rem',
        opacity: 0.9,
      }}>
        ✏️ מצב עריכה – עמוד זה נפתח בחלון חדש
      </div>

      {/* כפתור סגירה */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-back" onClick={() => window.close()}>
          ✕ סגור חלון
        </button>
      </div>

      {/* הטופס עצמו – ברנדרנו ישירות את AddPlaceModal ללא backdrop */}
      <div style={{
        background: 'var(--places-surface)',
        border: '1px solid var(--places-border)',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        maxWidth: 620,
        margin: '0 auto',
      }}>
        <AddPlaceModal
          place={place}
          onClose={() => window.close()}
          onPlaceUpdated={() => setSaved(true)}
          /* מעביר inline=true כדי לדכא את ה-backdrop */
          inline
        />
      </div>
    </div>
  );
}