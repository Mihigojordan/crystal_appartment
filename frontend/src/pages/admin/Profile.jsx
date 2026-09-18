import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '../../context/useAuth';
import { apiFetch } from '../../lib/apiClient';
import './Profile.css';

const SIGN_IN_METHODS = {
  password: 'Email & Password',
  'google.com': 'Google',
};

const readPref = (key) => {
  try {
    return localStorage.getItem(key) !== 'false';
  } catch {
    return true;
  }
};

const writePref = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTenure = (value) => {
  if (!value) return '—';
  const start = new Date(value).getTime();
  if (Number.isNaN(start)) return '—';
  const years = (Date.now() - start) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 1) return `${Math.max(1, Math.round(years * 12))} mo`;
  const rounded = Math.round(years);
  return `${rounded} yr${rounded === 1 ? '' : 's'}`;
};

export default function Profile() {
  const { profile, user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    department: profile?.department ?? '',
    officeLocation: profile?.officeLocation ?? '',
    bio: profile?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoNote, setPhotoNote] = useState(false);

  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');

  const [apartmentCount, setApartmentCount] = useState(null);
  const [activeBookingCount, setActiveBookingCount] = useState(null);
  const [activity, setActivity] = useState([]);

  const [bookingAlerts, setBookingAlerts] = useState(() => readPref('admin-pref-booking-alerts'));
  const [paymentAlerts, setPaymentAlerts] = useState(() => readPref('admin-pref-payment-alerts'));

  useEffect(() => {
    apiFetch('/apartments').then((list) => setApartmentCount(list.length)).catch(() => {});
    apiFetch('/bookings')
      .then((list) => setActiveBookingCount(list.filter((b) => b.status !== 'Cancelled').length))
      .catch(() => {});
    apiFetch('/dashboard/overview').then((d) => setActivity(d.recentActivity ?? [])).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(form) });
      await refreshProfile();
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSecurity = (field) => (e) => setSecurity((s) => ({ ...s, [field]: e.target.value }));

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMessage('');

    if (security.next !== security.confirm) {
      setSecurityError('New password and confirmation do not match.');
      return;
    }
    if (security.next.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }

    setSecuritySaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, security.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, security.next);
      setSecurity({ current: '', next: '', confirm: '' });
      setSecurityMessage('Password updated.');
    } catch (err) {
      setSecurityError(
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Current password is incorrect.'
          : err.message,
      );
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleLockScreen = async () => {
    await logout();
    navigate('/admin/login');
  };

  const toggleBookingAlerts = () => {
    setBookingAlerts((v) => {
      const next = !v;
      writePref('admin-pref-booking-alerts', next);
      return next;
    });
  };

  const togglePaymentAlerts = () => {
    setPaymentAlerts((v) => {
      const next = !v;
      writePref('admin-pref-payment-alerts', next);
      return next;
    });
  };

  const initial = (profile?.name || '?').charAt(0).toUpperCase();
  const providerId = user?.providerData?.[0]?.providerId;
  const signInMethod = SIGN_IN_METHODS[providerId] ?? '—';
  const isVerified = (profile?.status ?? 'Active') === 'Active';
  const canChangePassword = providerId === 'password';

  return (
    <div className="admin-profile">
      <div className="admin-profile__hero admin-branded-header">
        <div className="admin-profile__hero-identity">
          <div className="admin-profile__avatar">{initial}</div>
          <div>
            <h2>{profile?.name ?? 'Admin'}</h2>
            <p>
              {profile?.role ?? 'Administrator'}
              {profile?.department ? ` · ${profile.department}` : ''} · Classic Apartments
            </p>
          </div>
        </div>
        <div className="admin-profile__hero-actions">
          <button type="button" className="admin-profile__hero-btn" onClick={() => setPhotoNote(true)}>
            Change Photo
          </button>
          <button type="button" className="admin-profile__hero-btn admin-profile__hero-btn--solid" onClick={handleLockScreen}>
            Lock Screen
          </button>
        </div>
      </div>
      {photoNote && <p className="admin-profile__hint">Photo uploads aren't supported yet.</p>}

      <div className="admin-stat-grid">
        <div className="admin-card admin-stat-card">
          <span className="admin-stat-card__label">Properties Managed</span>
          <span className="admin-stat-card__value">{apartmentCount ?? '—'}</span>
        </div>
        <div className="admin-card admin-stat-card">
          <span className="admin-stat-card__label">Active Bookings</span>
          <span className="admin-stat-card__value">{activeBookingCount ?? '—'}</span>
        </div>
        <div className="admin-card admin-stat-card">
          <span className="admin-stat-card__label">With Classic Apartments</span>
          <span className="admin-stat-card__value">{formatTenure(user?.metadata?.creationTime)}</span>
        </div>
        <div className="admin-card admin-stat-card">
          <span className="admin-stat-card__label">Account Status</span>
          <span className={`admin-badge ${isVerified ? 'admin-badge-success' : 'admin-badge-warning'} admin-profile__status-badge`}>
            {isVerified ? 'Verified' : profile?.status ?? 'Unverified'}
          </span>
        </div>
      </div>

      <div className="admin-two-col-1-4">
        <div className="admin-profile__main">
          <div className="admin-card">
            <form className="admin-profile__form" onSubmit={handleSubmit}>
              <h3>Personal Information</h3>
              <p className="admin-text-muted admin-profile__section-hint">Keep your contact details up to date.</p>

              <div className="admin-profile__row">
                <div className="admin-profile__field">
                  <label>Full Name</label>
                  <input className="admin-input" value={form.name} onChange={update('name')} required />
                </div>
                <div className="admin-profile__field">
                  <label>Email</label>
                  <input className="admin-input" value={profile?.email ?? ''} disabled />
                </div>
              </div>

              <div className="admin-profile__row">
                <div className="admin-profile__field">
                  <label>Phone</label>
                  <input className="admin-input" value={form.phone} onChange={update('phone')} placeholder="Not set" />
                </div>
                <div className="admin-profile__field">
                  <label>Department</label>
                  <input className="admin-input" value={form.department} onChange={update('department')} placeholder="Not set" />
                </div>
              </div>

              <div className="admin-profile__row">
                <div className="admin-profile__field">
                  <label>Office Location</label>
                  <input className="admin-input" value={form.officeLocation} onChange={update('officeLocation')} placeholder="Not set" />
                </div>
                <div className="admin-profile__field">
                  <label>Role</label>
                  <input className="admin-input" value={profile?.role ?? ''} disabled />
                </div>
              </div>

              <div className="admin-profile__field">
                <label>Bio</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={form.bio}
                  onChange={update('bio')}
                  placeholder="Say a bit about your role…"
                />
              </div>

              {message && <p className="admin-profile__success">{message}</p>}
              {error && <p className="admin-login__error">{error}</p>}

              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Security</h3>
            <p className="admin-text-muted admin-profile__section-hint">Manage your password and login protection.</p>

            <form className="admin-profile__form" onSubmit={handleSecuritySubmit}>
              <div className="admin-profile__row admin-profile__row--3">
                <div className="admin-profile__field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={security.current}
                    onChange={updateSecurity('current')}
                    disabled={!canChangePassword}
                    required
                  />
                </div>
                <div className="admin-profile__field">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={security.next}
                    onChange={updateSecurity('next')}
                    disabled={!canChangePassword}
                    required
                  />
                </div>
                <div className="admin-profile__field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={security.confirm}
                    onChange={updateSecurity('confirm')}
                    disabled={!canChangePassword}
                    required
                  />
                </div>
              </div>

              {!canChangePassword && (
                <p className="admin-text-muted admin-profile__section-hint">
                  Signed in with Google — manage your password from your Google account.
                </p>
              )}
              {securityMessage && <p className="admin-profile__success">{securityMessage}</p>}
              {securityError && <p className="admin-login__error">{securityError}</p>}

              <div className="admin-profile__security-row">
                <div>
                  <strong>Two-Factor Authentication</strong>
                  <p className="admin-text-muted">Not available yet.</p>
                </div>
                <label className="admin-profile__switch admin-profile__switch--disabled">
                  <input type="checkbox" disabled />
                  <span />
                </label>
              </div>

              <button type="submit" className="admin-btn admin-btn-primary" disabled={securitySaving || !canChangePassword}>
                {securitySaving ? 'Updating…' : 'Update Security'}
              </button>
            </form>
          </div>
        </div>

        <div className="admin-profile__side">
          <div className="admin-card">
            <h3>Account Overview</h3>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Member Since</span>
              <span>{formatDate(user?.metadata?.creationTime)}</span>
            </div>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Sign-in Method</span>
              <span>{signInMethod}</span>
            </div>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Last Login</span>
              <span>{formatDate(user?.metadata?.lastSignInTime)}</span>
            </div>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Status</span>
              <span>{profile?.status ?? '—'}</span>
            </div>
          </div>

          <div className="admin-card">
            <h3>Preferences</h3>
            <div className="admin-profile__overview-row">
              <span>Booking Alerts</span>
              <label className="admin-profile__switch">
                <input type="checkbox" checked={bookingAlerts} onChange={toggleBookingAlerts} />
                <span />
              </label>
            </div>
            <div className="admin-profile__overview-row">
              <span>Overdue Payment Alerts</span>
              <label className="admin-profile__switch">
                <input type="checkbox" checked={paymentAlerts} onChange={togglePaymentAlerts} />
                <span />
              </label>
            </div>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Language</span>
              <span>{(localStorage.getItem('admin-language') || 'en').toUpperCase()}</span>
            </div>
            <div className="admin-profile__overview-row">
              <span className="admin-text-muted">Theme</span>
              <span className="admin-profile__capitalize">{localStorage.getItem('admin-theme') ?? 'dark'}</span>
            </div>
          </div>

          <div className="admin-card">
            <h3>Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="admin-empty-state">No activity recorded yet — logging isn't wired up yet.</p>
            ) : (
              <ul className="admin-overview__list">
                {activity.map((a, i) => (
                  <li key={i}>{a.activity}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
