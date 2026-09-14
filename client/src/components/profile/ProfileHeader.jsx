import { Link } from 'react-router-dom';

const ROLE_LABELS = {
  admin: 'מנהל/ת',
  user: 'משתמש/ת',
  regular: 'משתמש/ת',
};

export default function ProfileHeader({ profile, loading, error }) {
  if (loading) {
    return (
      <div className="profile-header profile-header--loading">
        <div className="profile-spinner" />
        <span>טוען פרופיל...</span>
      </div>
    );
  }

  if (error) {
    return <div className="profile-header profile-header--error">{error}</div>;
  }

  if (!profile) return null;

  const { username, email, role } = profile;
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  const roleLabel = ROLE_LABELS[role] || role || 'משתמש/ת';

  return (
    <div className="profile-header">
      <div className="profile-avatar" aria-hidden="true">{initial}</div>

      <div className="profile-header-info">
        <h1 className="profile-username">{username}</h1>
        <p className="profile-email">{email || 'אימייל לא זמין'}</p>
        <span className={`profile-role-badge profile-role-badge--${role}`}>{roleLabel}</span>
      </div>

      <Link to="/profile/edit" className="profile-edit-link">
        ✏️ עדכון פרופיל
      </Link>
    </div>
  );
}
