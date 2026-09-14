import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext.jsx';
import { loginUser } from '../../api/usersApi';
import '../../styles/pages/auth.css';

export default function AdminLogin() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data.user.role !== 'admin') {
        setError('שגיאה: אין לך הרשאות ניהול להתחברות זו.');
        return;
      }

      login({ ...data.user, token: data.token });
      navigate('/admin/users');
    } catch {
      setError('שגיאה בהתחברות. אנא נסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--admin">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">⚙️</div>
          <h1 className="auth-title">כניסת הנהלה</h1>
          <p className="auth-subtitle">התחברות לפאנל הניהול של המערכת</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">אימייל מנהל</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@system.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="הקלידי סיסמת ניהול"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-btn auth-btn--admin" disabled={loading}>
            {loading ? <span className="btn-spinner" aria-hidden="true" /> : 'הכנס לפאנל ניהול'}
          </button>
        </form>
      </div>
    </div>
  );
}
