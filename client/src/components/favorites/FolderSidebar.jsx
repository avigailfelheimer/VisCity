import { useState } from 'react';
import { FOLDER_VIEW } from '../../constants/favorites';

/**
 * FolderSidebar – רשימת התיקיות בעמוד "המועדפים שלי".
 *
 * - "כל המועדפים" ו"ללא תיקייה" הם תצוגות קבועות.
 * - תיקיות מותאמות אישית ניתנות ליצירה, שינוי שם ומחיקה.
 * - גרירת כרטיס מועדף ושחרור מעל תיקייה (או "ללא תיקייה") מעבירה אותו לשם.
 *
 * Props:
 *   folders        – [{ id, name }]
 *   activeFolderId – ה-id של התצוגה הפעילה (FOLDER_VIEW.ALL / UNFILED / folder.id)
 *   counts         – { all, unfiled, [folderId]: number }
 *   onSelect(id)
 *   onCreateFolder(name)
 *   onRenameFolder(id, name)
 *   onDeleteFolder(id)
 *   onDropItem(placeId, folderId|null)
 */
export default function FolderSidebar({
  folders,
  activeFolderId,
  counts,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDropItem,
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [dragOverId, setDragOverId] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) {
      setShowCreate(false);
      return;
    }
    onCreateFolder(name);
    setNewFolderName('');
    setShowCreate(false);
  };

  const startEdit = (folder) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameFolder(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  // dragOverKey: 'unfiled' לתצוגת "ללא תיקייה", או folder.id
  const dropHandlers = (dragOverKey, folderId) => ({
    onDragOver: (e) => {
      e.preventDefault();
      if (dragOverId !== dragOverKey) setDragOverId(dragOverKey);
    },
    onDragLeave: () => {
      setDragOverId((cur) => (cur === dragOverKey ? null : cur));
    },
    onDrop: (e) => {
      e.preventDefault();
      setDragOverId(null);
      const placeId = e.dataTransfer.getData('text/plain');
      if (placeId) onDropItem(placeId, folderId);
    },
  });

  return (
    <aside className="fav-sidebar" aria-label="תיקיות מועדפים">
      <button
        type="button"
        className={`fav-folder-item ${activeFolderId === FOLDER_VIEW.ALL ? 'fav-folder-item--active' : ''}`}
        onClick={() => onSelect(FOLDER_VIEW.ALL)}
      >
        <span className="fav-folder-item__icon" aria-hidden="true">⭐</span>
        <span className="fav-folder-item__name">כל המועדפים</span>
        <span className="fav-folder-item__count">{counts.all}</span>
      </button>

      <button
        type="button"
        className={[
          'fav-folder-item',
          activeFolderId === FOLDER_VIEW.UNFILED ? 'fav-folder-item--active' : '',
          dragOverId === 'unfiled' ? 'fav-folder-item--dragover' : '',
        ].join(' ').trim()}
        onClick={() => onSelect(FOLDER_VIEW.UNFILED)}
        {...dropHandlers('unfiled', null)}
      >
        <span className="fav-folder-item__icon" aria-hidden="true">📂</span>
        <span className="fav-folder-item__name">ללא תיקייה</span>
        <span className="fav-folder-item__count">{counts.unfiled}</span>
      </button>

      {folders.length > 0 && <div className="fav-sidebar__divider" />}

      <ul className="fav-folder-list">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className={[
              'fav-folder-row',
              activeFolderId === folder.id ? 'fav-folder-row--active' : '',
              dragOverId === folder.id ? 'fav-folder-row--dragover' : '',
            ].join(' ').trim()}
            {...dropHandlers(folder.id, folder.id)}
          >
            {editingId === folder.id ? (
              <form className="fav-folder-rename" onSubmit={(e) => { e.preventDefault(); commitEdit(); }}>
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitEdit}
                  aria-label="שם תיקייה חדש"
                />
              </form>
            ) : (
              <button type="button" className="fav-folder-item__main" onClick={() => onSelect(folder.id)}>
                <span className="fav-folder-item__icon" aria-hidden="true">📁</span>
                <span className="fav-folder-item__name">{folder.name}</span>
                <span className="fav-folder-item__count">{counts[folder.id] || 0}</span>
              </button>
            )}

            <div className="fav-folder-row__actions">
              <button
                type="button"
                className="fav-folder-action"
                title="שנה שם תיקייה"
                aria-label={`שנה שם לתיקייה ${folder.name}`}
                onClick={() => startEdit(folder)}
              >
                ✏️
              </button>
              <button
                type="button"
                className="fav-folder-action fav-folder-action--danger"
                title="מחק תיקייה"
                aria-label={`מחק תיקייה ${folder.name}`}
                onClick={() => {
                  if (window.confirm(`למחוק את התיקייה "${folder.name}"? הפריטים שבה יעברו ל"ללא תיקייה".`)) {
                    onDeleteFolder(folder.id);
                  }
                }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showCreate ? (
        <form className="fav-folder-create" onSubmit={handleCreateSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="שם התיקייה החדשה..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => { if (!newFolderName.trim()) setShowCreate(false); }}
            aria-label="שם התיקייה החדשה"
          />
          <button type="submit" className="fav-folder-create__btn">הוסף</button>
        </form>
      ) : (
        <button type="button" className="fav-add-folder-btn" onClick={() => setShowCreate(true)}>
          ➕ תיקייה חדשה
        </button>
      )}
    </aside>
  );
}
