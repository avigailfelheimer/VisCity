import { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { deletePlace } from '../../api/placesApi';
import AddPlaceModal from './AddPlaceModal';

/**
 * PlaceOwnerActions
 * 
 * כפתורי ערוך / מחק – מוצגים רק לבעל המקום.
 * לחיצה על "ערוך" פותחת את AddPlaceModal ישירות (ללא טאב חדש).
 */
export default function PlaceOwnerActions({ place, onDeleted, onUpdated }) {
  const { user } = useContext(UserContext);
  const [showEditModal, setShowEditModal] = useState(false);

  const currentUserId = user ? (user.id || user.user_id) : null;
  const placeOwnerId  = place ? place.created_by : null;
  const isOwner = Boolean(
    currentUserId &&
    placeOwnerId &&
    String(currentUserId) === String(placeOwnerId)
  );
  const isAdmin = user && (user.role === 'admin' || user.username === 'admin1');
  if (!isOwner && !isAdmin) return null;

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המקום הזה? פעולה זו בלתי הפיכה.')) return;
    try {
      await deletePlace(place.place_id, user.token);
      if (onDeleted) onDeleted(place.place_id);
      else window.location.reload();
    } catch (err) {
      alert('שגיאה במחיקה: ' + err.message);
    }
  };

  return (
    <>
      <div className="owner-actions-container">
        <button
          onClick={handleEdit}
          className="btn-owner-edit"
          title="ערוך מקום"
        >
          ✏️ ערוך
        </button>
        <button
          onClick={handleDelete}
          className="btn-owner-delete"
          title="מחק מקום"
        >
          🗑 מחק
        </button>
      </div>

      {showEditModal && (
        <AddPlaceModal
          place={place}
          onClose={() => setShowEditModal(false)}
          onPlaceUpdated={() => {
            setShowEditModal(false);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
}