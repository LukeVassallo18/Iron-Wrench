import './App.css'
import HeroSection from './components/HeroSection/HeroSection'
import Navbar from './components/Navbar/Navbar'

function App() {
  return (
    <main className="app-shell">
      <div className="app-container">
        <Navbar />

        <section className="app-content">
          <HeroSection />
        </section>
      </div>
    </main>
  )
}

export default App
