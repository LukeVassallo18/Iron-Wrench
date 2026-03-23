import './Navbar.css'

const navItems = ['Services', 'About']

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div>
          <p className="brand-title">Iron &amp; Wrench</p>
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
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
