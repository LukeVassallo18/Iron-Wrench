import './HeroSection.css'

function HeroSection() {
  return (
    <div className="hero-section">
      <h1 className="hero-title" aria-label="Your bike. Properly fixed.">
        <span className="hero-line">Your bike.</span>
        <span className="hero-line hero-line-accent">Properly</span>
        <span className="hero-line">fixed.</span>
      </h1>
      <p className="hero-text">
        Expert motorcycle servicing in the heart of the city.
      </p>
      <div className="hero-actions">
        <button type="button" className="btn-primary">
          Book a service
        </button>
      </div>
    </div>
  )
}

export default HeroSection
