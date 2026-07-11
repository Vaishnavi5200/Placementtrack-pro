import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/applications', label: 'Applications' },
  { to: '/follow-ups', label: 'Follow-ups' },
  { to: '/dsa', label: 'DSA Tracker' },
  { to: '/profile', label: 'Profile' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo />
          </NavLink>
          <div className="navbar__links">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="navbar__right">
          {user && <span className="navbar__user">{user.name}</span>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm navbar__mobile-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="navbar__mobile-links">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
