import "./App.css";
import BookService from "./components/BookService/BookService";
import BuiltBySection from "./components/BuiltBySection/BuiltBySection";
import HeroSection from "./components/HeroSection/HeroSection";
import Navbar from "./components/Navbar/Navbar";
import ServicesSection from "./components/ServicesSection/ServicesSection";

function App() {
  return (
    <main className="app-shell">
      <div className="app-container">
        <Navbar />

        <section className="app-content">
          <HeroSection />
          <ServicesSection />
          <BuiltBySection />
          <BookService />
        </section>
      </div>
    </main>
  );
}

export default App;
