import { useEffect, useState } from "react";
import "./Navbar.css";

const navItems = ["Services", "About"];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="brand">
        <div className="brand-content">
          <img src="/Iron&WrenchLogo.png" alt="Iron & Wrench Logo" />
          <span className="brand-title">Iron &amp; Wrench</span>
        </div>
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
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            </li>
          ))}
          <button className="book-now-btn">Book Now</button>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
