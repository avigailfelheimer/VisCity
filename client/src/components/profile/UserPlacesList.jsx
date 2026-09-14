import { Link } from 'react-router-dom';
import PlaceCard from '../places/PlaceCard';

export default function UserPlacesList({ places, loading, error }) {
  if (loading) {
    return (
      <div className="profile-tab-loading">
        <div className="profile-spinner" />
        <span>טוען טיולים...</span>
      </div>
    );
  }

  if (error) {
    return <div className="profile-tab-error">{error}</div>;
  }

  if (places.length === 0) {
    return (
      <div className="profile-tab-empty">
        <div className="profile-tab-empty__icon">🗺️</div>
        <p>עדיין לא יצרת טיולים.</p>
        <Link to="/places" className="profile-empty-link">לעמוד הטיולים</Link>
      </div>
    );
  }

  return (
    <div className="profile-places-grid">
      {places.map((place) => (
        <PlaceCard
          key={place.place_id}
          place={{ ...place, created_by: place.created_by_id ?? place.created_by }}
        />
      ))}
    </div>
  );
}
