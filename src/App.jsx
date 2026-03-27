import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthPage from "./components/Auth/AuthPage";
import BookingsPanel from "./components/BookingsPanel/BookingsPanel";
import BookService from "./components/BookService/BookService";
import BuiltBySection from "./components/BuiltBySection/BuiltBySection";
import HeroSection from "./components/HeroSection/HeroSection";
import Navbar from "./components/Navbar/Navbar";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import ServicesSection from "./components/ServicesSection/ServicesSection";
import WebGLScene from "./components/WebGLScene";
import { auth } from "./firebase";

const ADMIN_EMAILS = ["lukevas189@gmail.com", "admin@ex.com"];

function HomePage({ currentUser, isAdmin, onSignOut }) {
  return (
    <main className="app-shell">
      <div className="app-container home-page">
        <Navbar
          currentUser={currentUser}
          isAdmin={isAdmin}
          onSignOut={onSignOut}
        />

        <div className="home-layout">
          <section className="app-content-left">
            <section id="home">
              <HeroSection />
            </section>
            <section id="services">
              <ServicesSection />
            </section>
            <section id="about">
              <BuiltBySection />
            </section>
            {!isAdmin ? (
              <section id="book-service">
                <BookService currentUser={currentUser} />
              </section>
            ) : null}
          </section>
          <div
            className="hero-webgl-frame-right"
            aria-label="3D motorcycle preview"
          >
            <WebGLScene />
          </div>
        </div>
      </div>
    </main>
  );
}

function BookingsPage({ currentUser, isAdmin, onSignOut }) {
  return (
    <main className="app-shell">
      <div className="app-container">
        <Navbar
          currentUser={currentUser}
          isAdmin={isAdmin}
          onSignOut={onSignOut}
        />

        <section className="app-content">
          <BookingsPanel
            mode={isAdmin ? "admin" : "mine"}
            currentUser={currentUser}
          />
        </section>
      </div>
    </main>
  );
}

function UserProfilePage({ currentUser, isAdmin, onSignOut }) {
  return (
    <main className="app-shell">
      <div className="app-container">
        <Navbar
          currentUser={currentUser}
          isAdmin={isAdmin}
          onSignOut={onSignOut}
        />

        <section className="app-content">
          <ProfilePage currentUser={currentUser} isAdmin={isAdmin} />
        </section>
      </div>
    </main>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      document.documentElement.setAttribute("data-theme", "dark");
      return;
    }

    const savedTheme = localStorage.getItem(`iw_theme_${currentUser.uid}`);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
      return;
    }

    document.documentElement.setAttribute("data-theme", "dark");
  }, [currentUser]);

  const isAdmin = useMemo(
    () => ADMIN_EMAILS.includes(currentUser?.email?.toLowerCase() ?? ""),
    [currentUser],
  );

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <main className="app-shell">
        <div className="app-container">Loading...</div>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          currentUser ? (
            <HomePage
              currentUser={currentUser}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/bookings"
        element={
          currentUser ? (
            <BookingsPage
              currentUser={currentUser}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          currentUser ? (
            <UserProfilePage
              currentUser={currentUser}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={currentUser ? "/" : "/auth"} replace />}
      />
    </Routes>
  );
}

export default App;
