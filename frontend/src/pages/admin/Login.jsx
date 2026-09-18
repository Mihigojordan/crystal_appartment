import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { auth } from '../../firebase';
import logo from '../../assets/logo.png';
import apartmentImage from '../../assets/image2.jpg';
import '../../styles/admin-theme.css';
import './Login.css';

const ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts — try again shortly.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup — allow popups and try again.',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function describeError(err) {
  if (err.code) return ERROR_MESSAGES[err.code] ?? 'Unable to sign in. Please try again.';
  // Errors without a `.code` come from our own backend profile check
  // (verifyAdminOrSignOut) — e.g. "Account is not an administrator".
  return err.message || 'Unable to sign in. Please try again.';
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await login(email, password);
      navigate('/admin/overview');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleSubmitting(true);
    setError('');
    setNotice('');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await loginWithGoogle();
      navigate('/admin/overview');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Enter your email above first, then click "Forgot password?".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(`Password reset link sent to ${email}.`);
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div className="admin-root admin-login" data-theme="light">
      <div className="admin-login__panel">
        <div className="admin-login__content">
          <div className="admin-login__logo-wrap">
            <img src={logo} alt="Crystal Apartment" className="admin-login__logo" />
          </div>

          <h2>Sign in</h2>
          <p className="admin-login__lead">Access the Crystal Apartment admin console.</p>

          <form onSubmit={handleSubmit}>
            <div className="admin-login__field">
              <label htmlFor="login-email">Work email</label>
              <div className="admin-login__input-wrap">
                <FaEnvelope />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@crystalapartment.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-login__field">
              <label htmlFor="login-password">Password</label>
              <div className="admin-login__input-wrap">
                <FaLock />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-login__eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="admin-login__row">
              <label className="admin-login__checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="admin-login__link" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            </div>

            {error && <p className="admin-login__error">{error}</p>}
            {notice && <p className="admin-login__notice">{notice}</p>}

            <button type="submit" className="admin-btn admin-btn-primary admin-login__submit" disabled={submitting || googleSubmitting}>
              {submitting ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <div className="admin-login__divider"><span>or</span></div>

          <button
            type="button"
            className="admin-btn admin-btn-outline admin-login__google"
            onClick={handleGoogle}
            disabled={submitting || googleSubmitting}
          >
            <GoogleIcon /> {googleSubmitting ? 'Signing In…' : 'Continue with Google'}
          </button>

          <p className="admin-login__copyright">© {new Date().getFullYear()} Crystal Apartment</p>
        </div>
      </div>

      <div className="admin-login__media" style={{ backgroundImage: `url(${apartmentImage})` }} />
    </div>
  );
}
