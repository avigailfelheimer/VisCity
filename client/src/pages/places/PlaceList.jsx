import { useState, useEffect, useCallback, useContext } from 'react';
import { getPlaces } from '../../api/placesApi';
import PlaceCard from '../../components/places/PlaceCard';
import { UserContext } from '../../context/userContext';
import AddPlaceModal from '../../components/places/AddPlaceModal';
import '../../styles/pages/places.css';

const LIMIT = 12;

export default function PlaceList() {
  const [places,        setPlaces]        = useState([]);
  const [total,         setTotal]         = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [showAddModal,  setShowAddModal]  = useState(false);
  const { user } = useContext(UserContext);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPlaces({ page, limit: LIMIT, search: debouncedSearch });
      setPlaces(data.places    ?? []);
      setTotal(data.total      ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setError('שגיאה בטעינת המקומות. אנא נסו שוב.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  return (
    <div className="places-page">
      {/* Header */}
      <header className="places-header">
        <h1 className="places-header-title">
          <span className="emoji">✈️</span>
          יעדים מומלצים
          {total > 0 && !loading && (
            <span className="places-count">({total})</span>
          )}
        </h1>

        <div className="places-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="חיפוש לפי שם או תיאור..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש מקומות"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="נקה חיפוש"
            >
              ×
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      {user && (
        <div className="places-toolbar">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ הוסף טיול חדש
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddPlaceModal
          onClose={() => setShowAddModal(false)}
          onPlaceAdded={() => { setShowAddModal(false); fetchData(); }}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="places-loading">
          <div className="places-spinner" />
          <span>טוען מקומות...</span>
        </div>
      ) : error ? (
        <div className="places-error">{error}</div>
      ) : places.length === 0 ? (
        <div className="places-empty">
          <div className="empty-icon">🗺️</div>
          <p>לא נמצאו מקומות{debouncedSearch ? ` עבור "${debouncedSearch}"` : ''}.</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <PlaceCard key={place.place_id} place={place} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="places-pagination">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            הקודם
          </button>
          <span className="pagination-info">{page} / {totalPages}</span>
          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}