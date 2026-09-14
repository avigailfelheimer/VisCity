import { useCallback, useEffect, useRef, useState } from 'react';
import '../../styles/components/lightbox.css';

const SWIPE_THRESHOLD = 50; // px

/**
 * Lightbox – חלון קופץ לצפייה בתמונות (ולקבצי שמע) במסך מלא.
 *
 * ניתן לעבור בין הפריטים עם חיצי המקלדת, כפתורי החצים על המסך,
 * או החלקה (swipe) במכשירים מסוגלי-מגע. תומך גם בקובץ יחיד (ללא חיצים).
 *
 * Props:
 *   items     – מערך פריטים: [{ url, type?, alt?, caption?, uploadedBy?, uploadedAt? }]
 *   startIndex– האינדקס שאיתו נפתח החלון (ברירת מחדל 0)
 *   onClose() – נקראת כדי לסגור את החלון
 *   renderExtra(item, index) – (אופציונלי) JSX נוסף שמוצג מתחת לפרטי הפריט,
 *                              למשל כפתור "מחיקה" או קישור למקום
 */
export default function Lightbox({ items = [], startIndex = 0, onClose, renderExtra }) {
  const [index, setIndex] = useState(
    Math.min(Math.max(startIndex, 0), Math.max(items.length - 1, 0))
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef(null);

  const total = items.length;
  const current = items[index];
  const hasMultiple = total > 1;

  const goTo = useCallback((newIndex) => {
    if (total === 0) return;
    setImageLoaded(false);
    setIndex(((newIndex % total) + total) % total); // wrap-around
  }, [total]);

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // ── מקלדת: חיצים + Escape ──
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, goNext, goPrev]);

  // ── נעילת גלילת הרקע כל עוד החלון פתוח ──
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // ── תמיכה בהחלקה (swipe) במגע ──
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      // החלקה מימין לשמאל → התמונה הבאה, ולהפך
      if (deltaX < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (!current) return null;

  const isAudio = current.type === 'audio';

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || 'תצוגת מדיה'}
      dir="ltr"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="lightbox-content">
        <button
          type="button"
          className="lightbox-btn lightbox-btn--close"
          onClick={onClose}
          aria-label="סגור"
        >
          ✕
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              className="lightbox-btn lightbox-btn--prev"
              onClick={goPrev}
              aria-label="התמונה הקודמת"
            >
              ‹
            </button>
            <button
              type="button"
              className="lightbox-btn lightbox-btn--next"
              onClick={goNext}
              aria-label="התמונה הבאה"
            >
              ›
            </button>
          </>
        )}

        <div className="lightbox-media" onClick={(e) => e.stopPropagation()}>
          {isAudio ? (
            <div className="lightbox-audio">
              <span className="lightbox-audio__icon" aria-hidden="true">🎵</span>
              <audio src={current.url} controls autoPlay />
            </div>
          ) : (
            <>
              {!imageLoaded && <div className="lightbox-spinner" aria-hidden="true" />}
              <img
                key={current.url}
                src={current.url}
                alt={current.alt || current.caption || 'תמונה'}
                className={`lightbox-image ${imageLoaded ? 'is-loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          )}
        </div>

        <div className="lightbox-footer" dir="rtl" onClick={(e) => e.stopPropagation()}>
          <div className="lightbox-footer__info">
            {current.caption && <span className="lightbox-caption">{current.caption}</span>}
            {current.uploadedBy && (
              <span className="lightbox-uploader">צולם על ידי {current.uploadedBy}</span>
            )}
            {current.uploadedAt && (
              <span className="lightbox-date">{current.uploadedAt}</span>
            )}
          </div>

          <div className="lightbox-footer__actions">
            {renderExtra?.(current, index)}
            {hasMultiple && (
              <span className="lightbox-counter">{index + 1} / {total}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
