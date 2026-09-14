import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { updateUserProfile } from '../../api/usersApi';
import '../../styles/pages/profile.css';

const ROLE_LABELS = {
  admin: 'מנהל/ת',
  user: 'משתמש/ת',
  regular: 'משתמש/ת',
};

export default function ProfileEdit() {
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return <div className="profile-message">אנא היכנסו למערכת.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setError('יש למלא שם משתמש ואימייל.');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserProfile(user.id, { username: trimmedUsername, email: trimmedEmail }, user.token);
      login({ ...user, username: trimmedUsername, email: trimmedEmail });
      setSuccess('הפרופיל עודכן בהצלחה!');
      setTimeout(() => navigate('/profile'), 900);
    } catch {
      setError('שגיאה בעדכון הפרופיל. אנא נסו שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-card">
        <h1 className="profile-edit-title">עדכון פרופיל</h1>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          {error && <div className="profile-form-error">{error}</div>}
          {success && <div className="profile-form-success">{success}</div>}

          <div className="profile-form-group">
            <label htmlFor="username">שם משתמש</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="role">סוג משתמש</label>
            <input
              id="role"
              value={ROLE_LABELS[user.role] || user.role || ''}
              disabled
              className="profile-readonly-field"
            />
          </div>

          <div className="profile-edit-actions">
            <Link to="/profile" className="profile-cancel-btn">ביטול</Link>
            <button type="submit" className="profile-save-btn" disabled={submitting}>
              {submitting ? 'שומר...' : 'שמירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
