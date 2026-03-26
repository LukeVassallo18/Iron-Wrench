import {
    EmailAuthProvider,
    deleteUser,
    reauthenticateWithCredential,
    updateEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import './ProfilePage.css';

function ProfilePage({ currentUser, isAdmin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preferences');
  const [theme, setTheme] = useState('dark');
  const [username, setUsername] = useState(currentUser?.displayName ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const role = isAdmin ? 'admin' : 'user';
  const initial = useMemo(
    () => (username?.trim()?.charAt(0) || email?.charAt(0) || 'U').toUpperCase(),
    [username, email],
  );

  const applyTheme = (value) => {
    document.documentElement.setAttribute('data-theme', value);
  };

  const themeStorageKey = currentUser?.uid ? `iw_theme_${currentUser.uid}` : null;

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) return;

      const localTheme =
        themeStorageKey && localStorage.getItem(themeStorageKey) === 'light'
          ? 'light'
          : 'dark';

      setTheme(localTheme);
      applyTheme(localTheme);

      if (!db) return;

      try {
        const snapshot = await getDoc(doc(db, 'userProfiles', currentUser.uid));
        if (snapshot.exists()) {
          const data = snapshot.data();
          const storedTheme = data.theme === 'light' ? 'light' : 'dark';
          setTheme(storedTheme);
          applyTheme(storedTheme);
          if (themeStorageKey) {
            localStorage.setItem(themeStorageKey, storedTheme);
          }
          if (data.displayName) setUsername(data.displayName);
        }
      } catch {
        // Keep local preference if Firestore read fails.
      }
    };

    loadProfile();
  }, [currentUser, themeStorageKey]);

  const saveThemePreference = async (newTheme) => {
    if (!db || !currentUser?.uid) return;

    setTheme(newTheme);
    applyTheme(newTheme);
    if (themeStorageKey) {
      localStorage.setItem(themeStorageKey, newTheme);
    }
    setStatusMessage('');

    try {
      await setDoc(
        doc(db, 'userProfiles', currentUser.uid),
        {
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          displayName: username,
          theme: newTheme,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setStatusMessage('Theme preference saved.');
    } catch (error) {
      if (error?.code === 'permission-denied') {
        setStatusMessage('Theme could not be saved: Firestore permissions denied.');
      } else {
        setStatusMessage('Theme could not be saved.');
      }
    }
  };

  const saveAccountSettings = async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    setIsBusy(true);
    setStatusMessage('');

    try {
      await updateProfile(currentUser, { displayName: username.trim() });

      const normalizedEmail = email.trim().toLowerCase();
      const currentEmail = (currentUser.email ?? '').toLowerCase();

      if (normalizedEmail && normalizedEmail !== currentEmail) {
        const credential = EmailAuthProvider.credential(currentUser.email ?? '', currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updateEmail(currentUser, normalizedEmail);
      }

      if (db && currentUser.uid) {
        await setDoc(
          doc(db, 'userProfiles', currentUser.uid),
          {
            uid: currentUser.uid,
            email: normalizedEmail || currentUser.email || '',
            displayName: username.trim(),
            theme,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      setCurrentPassword('');
      setStatusMessage('Account settings updated.');
    } catch (error) {
      if (error?.code === 'auth/requires-recent-login') {
        setStatusMessage('Please sign in again, then retry account changes.');
      } else if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setStatusMessage('Current password is incorrect.');
      } else if (error?.code === 'permission-denied') {
        setStatusMessage('Profile write blocked by Firestore permissions.');
      } else {
        setStatusMessage(error.message ?? 'Could not update account settings.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    if (deleteConfirmText !== 'DELETE') {
      setStatusMessage('Type DELETE to confirm account deletion.');
      return;
    }

    setIsBusy(true);
    setStatusMessage('');

    try {
      const credential = EmailAuthProvider.credential(currentUser.email ?? '', deletePassword);
      await reauthenticateWithCredential(currentUser, credential);
      await deleteUser(currentUser);
      setIsDeleting(false);
      navigate('/auth');
    } catch (error) {
      if (error?.code === 'auth/requires-recent-login') {
        setStatusMessage('Please sign in again before deleting your account.');
      } else if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setStatusMessage('Password is incorrect.');
      } else {
        setStatusMessage(error.message ?? 'Could not delete account.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="profile-page">
      <h2 className="profile-title">Profile</h2>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <button
            type="button"
            className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account Settings
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            Delete Account
          </button>
        </aside>

        <article className="profile-card">
          <header className="profile-summary">
            <div className="profile-avatar" aria-hidden="true">
              {initial}
            </div>
            <div className="profile-details">
              <p>
                <strong>Email:</strong> {currentUser?.email ?? 'Unknown'}
              </p>
              <p>
                <strong>Role:</strong> {role}
              </p>
            </div>
          </header>

          {activeTab === 'preferences' ? (
            <section className="profile-panel">
              <h3>Theme preference</h3>
              <div className="theme-toggle-group">
                <button
                  type="button"
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => saveThemePreference('dark')}
                >
                  Dark mode
                </button>
                <button
                  type="button"
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => saveThemePreference('light')}
                >
                  Light mode
                </button>
              </div>
            </section>
          ) : null}

          {activeTab === 'account' ? (
            <section className="profile-panel">
              <h3>Account settings</h3>
              <form className="profile-form" onSubmit={saveAccountSettings}>
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Display name"
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </label>

                <label>
                  Current password (required to change email)
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="••••••••"
                  />
                </label>

                <button type="submit" disabled={isBusy}>
                  {isBusy ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </section>
          ) : null}

          {activeTab === 'danger' ? (
            <section className="profile-panel">
              <h3>Delete account</h3>
              <p className="profile-note">This action is permanent and cannot be undone.</p>
              <button
                type="button"
                className="delete-trigger-btn"
                onClick={() => setIsDeleting(true)}
              >
                Delete my account
              </button>
            </section>
          ) : null}

          {statusMessage ? <p className="profile-status-message">{statusMessage}</p> : null}
        </article>
      </div>

      {isDeleting ? (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm account deletion">
          <div className="profile-modal">
            <h3>Confirm account deletion</h3>
            <p>Type DELETE and enter your password to continue.</p>

            <label>
              Type DELETE
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder="DELETE"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleDeleteAccount}
                disabled={isBusy}
              >
                {isBusy ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProfilePage;
