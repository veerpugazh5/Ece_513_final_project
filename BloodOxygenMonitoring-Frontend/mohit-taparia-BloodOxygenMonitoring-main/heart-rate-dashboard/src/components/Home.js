import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styling/Home.css";
//import apiLinks from '../utils/apilinks';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">HRMS</div>
        <nav>
          <ul>
            <li onClick={() => navigate("/login")}>Login</li>
            <li onClick={() => navigate("/register")}>Register</li>
            <li onClick={() => navigate("/about")}>About</li>
            <li onClick={() => navigate("/contact")}>Contact</li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to the Heart Rate Monitoring System</h1>
          <p class="hero-description">Your one-stop platform for heart rate and health monitoring.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Real-Time Monitoring</h3>
            <p>Track your heart rate in real time, anywhere, anytime.</p>
          </div>
          <div className="feature-item">
            <h3>Personalized Insights</h3>
            <p>Get health insights tailored to your individual needs.</p>
          </div>
          <div className="feature-item">
            <h3>Secure Data</h3>
            <p>We prioritize your privacy with encrypted data storage.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p class="hero-description">© 2024 Heart Rate Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;