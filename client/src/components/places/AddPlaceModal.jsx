import { useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { createPlace, updatePlace } from '../../api/placesApi';
import { uploadMedia } from '../../api/mediaApi';
import PlaceLocationPicker from './PlaceLocationPicker';
import '../../styles/pages/places.css';

const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/**
 * AddPlaceModal – הוספה ועריכה.
 * שעות פתיחה מתומצתות ל-3 קבוצות: א-ה, שישי, שבת.
 * 
 * Props:
 *   onClose()          – סגירת המודל
 *   onPlaceAdded()     – callback לאחר יצירה
 *   onPlaceUpdated()   – callback לאחר עדכון
 *   place              – אם קיים → מצב עריכה
 *   inline             – אם true → מרנדר ללא backdrop
 */
export default function AddPlaceModal({ onClose, onPlaceAdded, onPlaceUpdated, place, inline = false }) {
  const { user } = useContext(UserContext);
  const isEdit = Boolean(place);

  // שעות פתיחה – 3 קבוצות
  const getGroupHours = (hours = {}) => {
    const sunThu = hours['sun'] || hours['mon'] || hours['tue'] || hours['wed'] || hours['thu'] || '';
    return {
      sunThu: hours['sun'] || hours['mon'] || hours['tue'] || hours['wed'] || hours['thu'] || '',
      fri:    hours['fri'] || '',
      sat:    hours['sat'] || '',
    };
  };

  const initHours = isEdit ? getGroupHours(place.opening_hours || {}) : { sunThu: '', fri: '', sat: '' };

  const [form, setForm] = useState({
    name:            isEdit ? (place.name        || '') : '',
    description:     isEdit ? (place.description || '') : '',
    categories:      isEdit && place.categories ? place.categories.join(', ') : '',
    latitude:        isEdit ? (place.latitude  ?? null) : null,
    longitude:       isEdit ? (place.longitude ?? null) : null,
    google_place_id: isEdit ? (place.google_place_id ?? null) : null,
  });

  const [hoursGroup, setHoursGroup] = useState(initHours);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(isEdit ? (place.image_url || '') : '');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('ניתן להעלות קבצי תמונה בלבד'); return; }
    if (file.size > MAX_IMAGE_SIZE) { setError('גודל התמונה חייב להיות עד 50MB'); return; }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => { setImageFile(null); setImagePreview(''); };

  const handleLocationChange = (location) => {
    setForm(prev => ({ ...prev, ...location }));
  };

  // פותח את שעות הקבוצות לפורמט יום-יום
  const buildOpeningHours = () => {
    const { sunThu, fri, sat } = hoursGroup;
    const result = {};
    ['sun','mon','tue','wed','thu'].forEach(d => { if (sunThu) result[d] = sunThu; });
    if (fri) result['fri'] = fri;
    if (sat) result['sat'] = sat;
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('שם המקום הוא שדה חובה'); return; }

    setLoading(true);
    setError('');

    const placeData = {
      name:            form.name.trim(),
      description:     form.description.trim(),
      categories:      form.categories.split(',').map(c => c.trim()).filter(Boolean),
      opening_hours:   buildOpeningHours(),
      latitude:        form.latitude,
      longitude:       form.longitude,
      google_place_id: form.google_place_id,
    };

    try {
      const placeId = isEdit
        ? place.place_id
        : (await createPlace(placeData, user.token)).place_id;

      if (isEdit) await updatePlace(place.place_id, placeData, user.token);

      if (imageFile) {
        try {
          await uploadMedia(placeId, imageFile, user.token);
        } catch (uploadErr) {
          setError('הנתונים נשמרו, אך העלאת התמונה נכשלה: ' + (uploadErr.message || ''));
          setLoading(false);
          return;
        }
      }

      if (isEdit) onPlaceUpdated?.();
      else onPlaceAdded?.();

      if (!inline) onClose();
    } catch (err) {
      setError(err.message || 'שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <>
      <div className="modal-header">
        <h2 className="modal-title">
          {isEdit ? '✏️ עריכת מקום' : '➕ הוספת מקום חדש'}
        </h2>
        {!inline && (
          <button className="modal-close-btn" onClick={onClose} aria-label="סגור">✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="modal-body modal-body--wide">
        {error && <div className="modal-error-message">{error}</div>}

        {/* ROW 1: שם + קטגוריות */}
        <div className="modal-row-2">
          <div className="form-group">
            <label className="form-label">שם המקום *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="לדוגמה: עין גדי"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              קטגוריות{' '}
              <span style={{ fontWeight: 400, color: 'var(--places-text-muted)' }}>(מופרדות בפסיק)</span>
            </label>
            <input
              name="categories"
              value={form.categories}
              onChange={handleChange}
              className="form-input"
              placeholder="משפחתי, טבע, חינם"
            />
          </div>
        </div>

        {/* ROW 2: תיאור */}
        <div className="form-group">
          <label className="form-label">תיאור</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="form-input form-textarea"
            placeholder="ספר קצת על המקום..."
          />
        </div>

        {/* ROW 3: מיקום + תמונה */}
        <div className="modal-row-2">
          <div>
            <PlaceLocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={handleLocationChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תמונה ראשית</label>
            <div className="image-upload-box">
              {imagePreview ? (
                <div className="image-preview-wrap">
                  <img src={imagePreview} alt="תצוגה מקדימה של התמונה" className="image-preview" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={handleRemoveImage}
                    aria-label="הסר תמונה"
                  >✕</button>
                </div>
              ) : (
                <label htmlFor="place-image-input" className="image-upload-label">
                  <span className="image-upload-icon">📷</span>
                  <span>לחצו להעלאת תמונה</span>
                  <small>JPG, PNG, GIF או WEBP עד 50MB</small>
                </label>
              )}
              <input
                id="place-image-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ROW 4: שעות פתיחה – 3 תיבות */}
        <div className="form-group">
          <label className="form-label">שעות פתיחה</label>
          <div className="hours-grid-compact">
            <div className="hour-row">
              <small className="day-name">ראשון – חמישי</small>
              <input
                value={hoursGroup.sunThu}
                onChange={(e) => setHoursGroup(p => ({ ...p, sunThu: e.target.value }))}
                className="form-input hour-input"
                placeholder="09:00–17:00"
              />
            </div>
            <div className="hour-row">
              <small className="day-name">שישי</small>
              <input
                value={hoursGroup.fri}
                onChange={(e) => setHoursGroup(p => ({ ...p, fri: e.target.value }))}
                className="form-input hour-input"
                placeholder="09:00–14:00"
              />
            </div>
            <div className="hour-row">
              <small className="day-name">שבת</small>
              <input
                value={hoursGroup.sat}
                onChange={(e) => setHoursGroup(p => ({ ...p, sat: e.target.value }))}
                className="form-input hour-input"
                placeholder="סגור"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ שומר...' : isEdit ? 'שמור שינויים' : 'צור מקום'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </form>
    </>
  );

  if (inline) {
    return (
      <div className="modal-window" style={{ maxWidth: '100%', maxHeight: 'none', borderRadius: 0 }}>
        {FormContent}
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-window modal-window--wide animate-fade-in" role="dialog" aria-modal="true">
        {FormContent}
      </div>
    </div>
  );
}