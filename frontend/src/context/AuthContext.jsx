import { useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { apiFetch } from '../lib/apiClient';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const me = await apiFetch('/auth/me');
    setProfile(me);
    return me;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await refreshProfile();
        } catch {
          // Signed into Firebase but no matching admin profile — treat as
          // signed out of the admin area rather than leaving stale state.
          setProfile(null);
          await signOut(auth);
          setUser(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshProfile]);

  // Both sign-in paths verify the Firestore admin profile before resolving,
  // so the caller can show "not an admin" as an error instead of briefly
  // flashing the dashboard and then getting bounced by onAuthStateChanged.
  const verifyAdminOrSignOut = async () => {
    try {
      await refreshProfile();
    } catch (err) {
      await signOut(auth);
      throw err;
    }
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    await verifyAdminOrSignOut();
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
    await verifyAdminOrSignOut();
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, loginWithGoogle, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
