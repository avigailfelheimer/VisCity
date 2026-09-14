import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext.jsx';
import { getAllUsers, deleteUser, getOnlineUsers, updateUser, createUser } from '../../api/usersApi';
import '../../styles/pages/profile.css';

export default function UsersAdmin() {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({ username: '', email: '', role: 'user' });
  const [createFields, setCreateFields] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    if (!user) return;
    const token = user.token;

    const load = async () => {
      setLoading(true);
      try {
        const all = await getAllUsers(token);
        const onlineList = await getOnlineUsers(token);
        setUsers(all);
        setOnline(onlineList.map((u) => u.id));
      } catch (err) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('למחוק משתמש זה? פעולה בלתי הפיכה')) return;
    try {
      await deleteUser(id, user.token);
      setUsers((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      alert('שגיאה בשמירה: ' + (err.message || err));
    }
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setEditFields({ username: u.username || '', email: u.email || '', role: u.role || 'user' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditFields({ username: '', email: '', role: 'user' });
  };

  const saveEdit = async (id) => {
    try {
      const payload = { username: editFields.username, email: editFields.email };
      if (editFields.role !== undefined) payload.role = editFields.role;
      await updateUser(id, payload, user.token);
      setUsers((s) => s.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      cancelEdit();
    } catch (err) {
      alert('שגיאה בעדכון: ' + (err.message || err));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: createFields.username, email: createFields.email, password: createFields.password, role: createFields.role };
      const res = await createUser(payload, user.token);
      if (res && res.user) {
        setUsers((s) => [...s, res.user]);
        setCreateFields({ username: '', email: '', password: '', role: 'user' });
      }
    } catch (err) {
      alert('שגיאה ביצירה: ' + (err.message || err));
    }
  };

  if (!user) return null;
  if (user.role !== 'admin' && user.user_type !== 'admin') return <div style={{ textAlign: 'center', marginTop: '50px' }}>אין הרשאה לפאנל זה</div>;
return (
  <div className="profile-page admin-users-page">

    {/* ================= HEADER ================= */}

    <div className="profile-header">

      <div className="profile-avatar">
        👥
      </div>

      <div className="profile-header-info">

        <h1 className="profile-username">
          ניהול משתמשים
        </h1>

        <p className="profile-email">
          צפייה, עריכה, מחיקה ויצירת משתמשים
        </p>

        <span className="profile-role-badge profile-role-badge--admin">
          ADMIN DASHBOARD
        </span>

      </div>

    </div>

    {error && (
      <div className="profile-form-error">
        {error}
      </div>
    )}

    {loading ? (

      <div className="profile-tab-loading">

        <div className="profile-spinner"></div>

        <p>טוען משתמשים...</p>

      </div>

    ) : (

      <>

        {/* ================= USERS ================= */}

        <div className="admin-users-grid">

          {users.map((u) => (

            <div className="admin-user-card" key={u.id}>

              <div className="admin-user-top">

                <div className="profile-avatar">
                  {u.username?.charAt(0).toUpperCase()}
                </div>

                <div>

                  <h3>{u.username}</h3>

                  <p>{u.email}</p>

                </div>

              </div>

              <div className="admin-user-status">

                {online.includes(u.id)
                  ? "🟢 מחובר"
                  : "⚪ לא מחובר"}

              </div>

              <div
                style={{
                  marginTop: "1rem",
                  fontWeight: 800
                }}
              >

                Role:

                {editId === u.id ? (

                  <select
                    value={editFields.role}
                    onChange={(e) =>
                      setEditFields((s) => ({
                        ...s,
                        role: e.target.value
                      }))
                    }
                  >

                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                ) : (

                  <span style={{ marginRight: 8 }}>
                    {u.role}
                  </span>

                )}

              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: ".75rem"
                }}
              >

                {editId === u.id ? (

                  <>

                    <input
                      value={editFields.username}
                      onChange={(e) =>
                        setEditFields((s) => ({
                          ...s,
                          username: e.target.value
                        }))
                      }
                      placeholder="Username"
                    />

                    <input
                      value={editFields.email}
                      onChange={(e) =>
                        setEditFields((s) => ({
                          ...s,
                          email: e.target.value
                        }))
                      }
                      placeholder="Email"
                    />

                  </>

                ) : null}

              </div>

              <div className="admin-user-actions">

                {editId === u.id ? (

                  <>

                    <button
                      onClick={() => saveEdit(u.id)}
                    >
                      💾 שמור
                    </button>

                    <button
                      onClick={cancelEdit}
                    >
                      ↩ ביטול
                    </button>

                  </>

                ) : (

                  <>

                    <button
                      onClick={() => startEdit(u)}
                    >
                      ✏ ערוך
                    </button>

                    {user.id !== u.id && (

                      <button
                        className="danger"
                        onClick={() =>
                          handleDelete(u.id)
                        }
                      >
                        🗑 מחק
                      </button>

                    )}

                  </>

                )}

              </div>

            </div>

          ))}

        </div>

        {/* ================= CREATE USER ================= */}

        <div
          className="profile-edit-card"
          style={{ marginTop: "3rem" }}
        >

          <h2 className="profile-edit-title">

            ➕ יצירת משתמש חדש

          </h2>

          <form
            className="profile-edit-form"
            onSubmit={handleCreate}
          >

            <div className="profile-form-group">

              <label>Username</label>

              <input
                value={createFields.username}
                onChange={(e) =>
                  setCreateFields((s) => ({
                    ...s,
                    username: e.target.value
                  }))
                }
              />

            </div>

            <div className="profile-form-group">

              <label>Email</label>

              <input
                type="email"
                value={createFields.email}
                onChange={(e) =>
                  setCreateFields((s) => ({
                    ...s,
                    email: e.target.value
                  }))
                }
              />

            </div>

            <div className="profile-form-group">

              <label>Password</label>

              <input
                type="password"
                value={createFields.password}
                onChange={(e) =>
                  setCreateFields((s) => ({
                    ...s,
                    password: e.target.value
                  }))
                }
              />

            </div>

            <div className="profile-form-group">

              <label>Role</label>

              <select
                value={createFields.role}
                onChange={(e) =>
                  setCreateFields((s) => ({
                    ...s,
                    role: e.target.value
                  }))
                }
              >

                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

            </div>

            <div className="profile-edit-actions">

              <button
                type="submit"
                className="profile-save-btn"
              >
                🚀 צור משתמש
              </button>

            </div>

          </form>

        </div>

      </>

    )}

  </div>
);
}
