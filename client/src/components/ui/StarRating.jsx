export default function StarRating({ rating, count = 0, size = 'md' }) {
  const safeRating = Number(rating) || 0;
  const safeCount  = Number(count) || 0;
  const pct = Math.max(0, Math.min(5, safeRating)) / 5 * 100;

  const label = safeCount > 0
    ? `דירוג ${safeRating.toFixed(1)} מתוך 5, ${safeCount} חוות דעת`
    : 'אין דירוגים עדיין';

  return (
    <div className={`star-rating star-rating--${size}`} aria-label={label}>
      <div className="star-rating__stars" aria-hidden="true">
        <div className="star-rating__track">★★★★★</div>
        <div className="star-rating__fill" style={{ width: `${pct}%` }}>★★★★★</div>
      </div>
      <span className="star-rating__count">
        {safeCount > 0 ? `${safeRating.toFixed(1)} (${safeCount})` : 'אין דירוגים'}
      </span>
    </div>
  );
}
