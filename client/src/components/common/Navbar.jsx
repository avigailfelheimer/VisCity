import { useState, useRef, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import '../../styles/components/navbar.css';
import logoImg from '../../assets/logo.png';

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
const dropdownLinkClass = ({ isActive }) => `dropdown-item${isActive ? ' active' : ''}`;

export default function Navbar() {
  const { user, logout } = useContext(UserContext);

  const [openMenu, setOpenMenu] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const menuRef = useRef();
  const userRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }

      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
    }

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="top-nav" dir="rtl">
      <div className="nav-right">

        <Link to="/home" className="logo-wrap">
          <img
            src={logoImg}
            alt="לוגו"
            className="nav-logo"
            draggable="false"
          />
        </Link>

      </div>

      <div className="nav-center">
        <NavLink to="/home" className={navLinkClass}>
          דף הבית
        </NavLink>

        <NavLink to="/places" className={navLinkClass}>
          טיולים
        </NavLink>

        <NavLink to="/gallery" className={navLinkClass}>
          גלריה
        </NavLink>

        {(user &&
          (user.role === 'admin' || user.username === 'admin1')) && (
          <NavLink to="/admin/users" className={navLinkClass}>
            ניהול משתמשים
          </NavLink>
        )}

        {user && (
          <NavLink to="/favorites" className={navLinkClass}>
            המועדפים שלי
          </NavLink>
        )}
      </div>

      <div className="nav-left">
        <div ref={menuRef} className="mobile-menu">

          <button
            className="hamburger"
            onClick={() => setOpenMenu((s) => !s)}
            aria-label="תפריט"
          >
            ☰
          </button>

          {openMenu && (
            <div className="mobile-menu-pop">
              <NavLink to="/home" className={navLinkClass} onClick={() => setOpenMenu(false)}>
                דף הבית
              </NavLink>

              <NavLink to="/places" className={navLinkClass} onClick={() => setOpenMenu(false)}>
                טיולים
              </NavLink>

              <NavLink to="/gallery" className={navLinkClass} onClick={() => setOpenMenu(false)}>
                גלריה
              </NavLink>
            </div>
          )}
        </div>

        <div ref={userRef} className="user-area">
          {!user ? (
            <Link to="/login" className="auth-link">
              התחברות/הרשמה
            </Link>
          ) : (
            <div className="user-dropdown">
              <button
                className="user-btn"
                onClick={() => setOpenUser((s) => !s)}
              >
                שלום, {user.username}
              </button>

              {openUser && (
                <div className="dropdown-menu">
                  <NavLink to="/profile" end className={dropdownLinkClass} onClick={() => setOpenUser(false)}>
                    צפיה בפרופיל
                  </NavLink>

                  <NavLink to="/profile/edit" className={dropdownLinkClass} onClick={() => setOpenUser(false)}>
                    עדכון פרופיל
                  </NavLink>

                  <NavLink to="/favorites" className={dropdownLinkClass} onClick={() => setOpenUser(false)}>
                    מסלולים מותאמים אישית
                  </NavLink>

                  {(user.role === 'admin' ||
                    user.username === 'admin1') && (
                    <NavLink
                      to="/admin/users"
                      className={dropdownLinkClass}
                      onClick={() => setOpenUser(false)}
                    >
                      מנהל משתמשים
                    </NavLink>
                  )}

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
