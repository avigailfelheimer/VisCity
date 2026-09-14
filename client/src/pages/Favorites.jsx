import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { useFavorites } from '../context/FavoritesContext';
import FolderSidebar from '../components/favorites/FolderSidebar';
import FavoritePlaceCard from '../components/favorites/FavoritePlaceCard';
import { FOLDER_VIEW } from '../constants/favorites';
import '../styles/pages/favorites.css';

export default function Favorites() {
  const { user } = useContext(UserContext);
  const {
    favorites,
    folders,
    loading,
    addFolder,
    renameFolder,
    deleteFolder,
    moveItemToFolder,
  } = useFavorites();

  const [activeFolder, setActiveFolder] = useState(FOLDER_VIEW.ALL);

  const counts = useMemo(() => {
    const result = { all: favorites.length, unfiled: 0 };
    folders.forEach((folder) => { result[folder.id] = 0; });
    favorites.forEach((item) => {
      if (!item.folderId) {
        result.unfiled += 1;
      } else {
        result[item.folderId] = (result[item.folderId] || 0) + 1;
      }
    });
    return result;
  }, [favorites, folders]);

  const visibleItems = useMemo(() => {
    if (activeFolder === FOLDER_VIEW.ALL) return favorites;
    if (activeFolder === FOLDER_VIEW.UNFILED) return favorites.filter((item) => !item.folderId);
    return favorites.filter((item) => item.folderId === activeFolder);
  }, [favorites, activeFolder]);

  const handleDeleteFolder = (folderId) => {
    if (activeFolder === folderId) setActiveFolder(FOLDER_VIEW.ALL);
    deleteFolder(folderId);
  };

  if (!user) {
    return (
      <div className="favorites-page">
        <header className="favorites-header">
          <h1>המועדפים שלי <span className="fav-heart-emoji">❤️</span></h1>
          <p className="muted">שמרו טיולים שאהבתם וסדרו אותם בתיקיות משלכם</p>
        </header>
        <div className="fav-empty">
          <p>יש להתחבר כדי לראות ולנהל את המועדפים שלך.</p>
          <Link to="/login" className="btn-primary">התחברות / הרשמה</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1>המועדפים שלי <span className="fav-heart-emoji">❤️</span></h1>
        <p className="muted">לחצו על הלב בכל טיול כדי לשמור אותו כאן, וסדרו את הכל בתיקיות משלכם</p>
        {favorites.length > 0 && (
          <div className="favorites-stats">
            <span className="favorites-stat favorites-stat--total">
              <span aria-hidden="true">🧡</span>
              <strong>{favorites.length}</strong> טיולים שמורים
            </span>
            <span className="favorites-stat favorites-stat--folders">
              <span aria-hidden="true">📁</span>
              <strong>{folders.length}</strong> תיקיות
            </span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="loading-spinner">טוען מועדפים...</div>
      ) : favorites.length === 0 ? (
        <div className="fav-empty">
          <p>עדיין אין מועדפים. לחצו על ❤️ בכל טיול כדי לשמור אותו כאן.</p>
          <Link to="/places" className="btn-primary">לעיון בטיולים</Link>
        </div>
      ) : (
        <div className="favorites-layout">
          <FolderSidebar
            folders={folders}
            activeFolderId={activeFolder}
            counts={counts}
            onSelect={setActiveFolder}
            onCreateFolder={addFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDropItem={moveItemToFolder}
          />

          <div className="favorites-content">
            {visibleItems.length === 0 ? (
              <div className="fav-empty fav-empty--inline">
                אין פריטים בתצוגה הזו. גררו לכאן מועדף מהרשימה, או בחרו תצוגה אחרת.
              </div>
            ) : (
              <div className="fav-grid">
                {visibleItems.map((item) => (
                  <FavoritePlaceCard
                    key={item.placeId}
                    item={item}
                    folders={folders}
                    onMove={moveItemToFolder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
