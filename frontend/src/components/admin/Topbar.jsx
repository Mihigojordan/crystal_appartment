import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaExpand,
  FaCompress,
  FaBell,
  FaChevronDown,
  FaMagic,
  FaCog,
} from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { apiFetch } from '../../lib/apiClient';
import logo from '../../assets/logo.png';
import 'flag-icons/css/flag-icons.min.css';
import './Topbar.css';

// Emoji flags render as literal "US"/"FR" text on platforms without a
// color-emoji font (seen on headless Chromium, some Windows setups) — using
// the flag-icons sprite library instead guarantees the flag always renders.
const LANGUAGES = [
  { code: 'en', country: 'us', label: 'English' },
  { code: 'fr', country: 'fr', label: 'Français' },
  { code: 'es', country: 'es', label: 'Español' },
  { code: 'rw', country: 'rw', label: 'Kinyarwanda' },
];

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return [isFullscreen, toggle];
}

export default function Topbar({ theme, sidebarExpanded, onToggleTheme, onToggleSidebar, search, onSearchChange }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [language, setLanguage] = useState(
    () => LANGUAGES.find((l) => l.code === localStorage.getItem('admin-language')) ?? LANGUAGES[0],
  );
  const [isFullscreen, toggleFullscreen] = useFullscreen();
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const bookingAlertsOn = localStorage.getItem('admin-pref-booking-alerts') !== 'false';
    const paymentAlertsOn = localStorage.getItem('admin-pref-payment-alerts') !== 'false';

    apiFetch('/dashboard/reports')
      .then((r) => {
        const items = [];
        if (bookingAlertsOn && r.bookings.byStatus.Pending > 0) {
          items.push({
            id: 'pending-bookings',
            text: `${r.bookings.byStatus.Pending} pending booking request${r.bookings.byStatus.Pending > 1 ? 's' : ''}`,
            to: '/admin/bookings',
          });
        }
        if (paymentAlertsOn && r.tenants.byPaymentStatus.Overdue > 0) {
          items.push({
            id: 'overdue-tenants',
            text: `${r.tenants.byPaymentStatus.Overdue} tenant${r.tenants.byPaymentStatus.Overdue > 1 ? 's' : ''} overdue on payment`,
            to: '/admin/tenants',
          });
        }
        setNotifications(items);
      })
      .catch(() => setNotifications([]));
  }, []);

  const selectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('admin-language', lang.code);
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__brand">
        <div className="admin-topbar__logo-badge">
          <img src={logo} alt="Crystal Apartment" />
        </div>
        {sidebarExpanded && (
          <span className="admin-topbar__wordmark">
            Crystal<strong>Apartment</strong>
          </span>
        )}
      </div>

      <button type="button" className="admin-topbar__collapse-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        {sidebarExpanded ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
      </button>

      <div className="admin-topbar__search">
        <FaSearch />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search apartments, tenants, bookings…"
          value={search ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        <kbd className="admin-topbar__kbd">Ctrl K</kbd>
      </div>

      <button
        type="button"
        className="admin-topbar__predict-btn"
        onClick={() => navigate('/admin/predictions')}
      >
        <FaMagic /> <span>Prediction Center</span>
      </button>

      <div className="admin-topbar__actions">
        <div className="admin-topbar__dropdown-wrap">
          <button
            type="button"
            className="admin-topbar__icon-btn admin-topbar__lang-btn"
            onClick={() => { setLangOpen((v) => !v); setNotifOpen(false); }}
            aria-label="Change language"
          >
            <span className={`fi fi-${language.country} admin-topbar__flag`} />
            <FaChevronDown className="admin-topbar__chevron" />
          </button>
          {langOpen && (
            <div className="admin-topbar__menu admin-topbar__lang-menu" onClick={(e) => e.stopPropagation()}>
              {LANGUAGES.map((lang) => (
                <button key={lang.code} type="button" onClick={() => selectLanguage(lang)}>
                  <span className={`fi fi-${lang.country} admin-topbar__flag`} /> {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="admin-topbar__icon-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>

        <button type="button" className="admin-topbar__icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        <div className="admin-topbar__dropdown-wrap">
          <button
            type="button"
            className="admin-topbar__icon-btn admin-topbar__bell-btn"
            onClick={() => { setNotifOpen((v) => !v); setLangOpen(false); }}
            aria-label="Notifications"
          >
            <FaBell />
            {notifications.length > 0 && <span className="admin-topbar__badge">{notifications.length}</span>}
          </button>
          {notifOpen && (
            <div className="admin-topbar__menu admin-topbar__notif-menu" onClick={(e) => e.stopPropagation()}>
              {notifications.length === 0 ? (
                <p className="admin-topbar__notif-empty">You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <button key={n.id} type="button" onClick={() => { navigate(n.to); setNotifOpen(false); }}>
                    {n.text}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button type="button" className="admin-topbar__icon-btn" onClick={() => navigate('/admin/profile')} aria-label="Settings">
          <FaCog />
        </button>

        <div className="admin-topbar__dropdown-wrap">
          <button type="button" className="admin-topbar__avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Account menu">
            <div className="admin-topbar__avatar">{(profile?.name || '?').charAt(0)}</div>
          </button>

          {menuOpen && (
            <div className="admin-topbar__menu admin-topbar__profile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="admin-topbar__profile-info">
                <strong>{profile?.name ?? 'Admin'}</strong>
                <span>{profile?.role ?? 'Administrator'}</span>
              </div>
              <button type="button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
