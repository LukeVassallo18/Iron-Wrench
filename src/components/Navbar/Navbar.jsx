import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const MobileWrenchAnimation = lazy(() => import("./MobileWrenchAnimation"));

function Navbar({ currentUser, isAdmin, onSignOut }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToSection = (targetId) => {
    const section = document.getElementById(targetId);
    if (!section) return;

    const navbar = document.querySelector(".navbar");
    const offset = (navbar?.offsetHeight ?? 0) + 12;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    setIsMenuOpen(false);
  };

  const navigateToHomeSection = (targetId) => {
    if (location.pathname === "/") {
      scrollToSection(targetId);
      return;
    }

    navigate("/");
    window.setTimeout(() => scrollToSection(targetId), 120);
  };

  const navItems = [
    { label: "Services", action: () => navigateToHomeSection("services") },
    { label: "About", action: () => navigateToHomeSection("about") },
    {
      label: isAdmin ? "Bookings" : "My Bookings",
      action: () => navigate("/bookings"),
    },
  ];

  const profileInitial = (
    currentUser?.email?.trim()?.charAt(0) || "U"
  ).toUpperCase();

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="brand">
        <button
          type="button"
          className="brand-link"
          onClick={() => {
            navigate("/");
            setIsMenuOpen(false);
          }}
          aria-label="Go to home page"
        >
          <div className="brand-content">
            <img src="/Iron&WrenchLogo.png" alt="Iron & Wrench Logo" />
            <span className="brand-title">Iron &amp; Wrench</span>
          </div>
        </button>
      </div>

      <button
        type="button"
        className="mobile-menu-btn"
        aria-expanded={isMenuOpen}
        aria-controls="primary-nav"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? "Close" : "Menu"}
      </button>

      <nav
        id="primary-nav"
        className={`nav-right ${isMenuOpen ? "open" : ""}`}
        aria-label="Primary"
      >
        <div className="mobile-wrench-track" aria-hidden="true">
          <Suspense fallback={null}>
            {isMenuOpen ? <MobileWrenchAnimation isOpen={isMenuOpen} /> : null}
          </Suspense>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className="nav-link"
                onClick={(event) => {
                  event.preventDefault();
                  item.action();
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}

          {!isAdmin ? (
            <button
              className="book-now-btn nav-action-btn"
              type="button"
              onClick={() => navigateToHomeSection("book-service")}
            >
              Book Now
            </button>
          ) : null}

          <button
            className="profile-circle-btn"
            type="button"
            aria-label="Open profile"
            title="Profile"
            onClick={() => {
              navigate("/profile");
              setIsMenuOpen(false);
            }}
          >
            {profileInitial}
          </button>

          <button
            className="sign-out-btn nav-action-btn"
            type="button"
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
