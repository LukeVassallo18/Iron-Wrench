import "./Navbar.css";

const navItems = ["Services", "About"];

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-content">
          <img src="/Iron&WrenchLogo.png" alt="Iron & Wrench Logo" />
          <span className="brand-title">Iron &amp; Wrench</span>
        </div>
      </div>

      <nav className="nav-right" aria-label="Primary">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#" className="nav-link">
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
