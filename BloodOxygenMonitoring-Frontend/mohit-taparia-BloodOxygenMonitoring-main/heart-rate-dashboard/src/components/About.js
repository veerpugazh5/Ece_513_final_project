import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styling/About.css";

// Import images
import team1 from "../images/team1.jpeg";
import team2 from "../images/team2.jpeg";
import team3 from "../images/team3.jpeg";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Heart Rate Monitoring System</div>
        <nav>
          <ul>
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/login")}>Login</li>
            <li onClick={() => navigate("/register")}>Register</li>
          </ul>
        </nav>
      </header>

      {/* About Section */}
      <section className="about-section">
        <h1>About the Project</h1>
        <p>
          The Heart Rate Monitoring System is a cutting-edge application designed
          to help users track their heart rate and health metrics. This platform
          integrates real-time monitoring, personalized health insights, and
          secure data storage to provide a seamless experience for patients and
          physicians alike.
        </p>
        <p>
          Whether you are a healthcare professional or an individual, this
          platform empowers you to stay informed and proactive about your health.
        </p>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-container">
          <div className="team-member">
            <img src={team1} alt="Veeramani" />
            <h3>Veeramani</h3>
            <p>Project Manager</p>
          </div>
          <div className="team-member">
            <img src={team2} alt="Srinivasan" />
            <h3>Srinivasan</h3>
            <p>Lead Developer</p>
          </div>
          <div className="team-member">
            <img src={team3} alt="Mohit" />
            <h3>Mohit</h3>
            <p>UI/UX Designer</p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <h2>Learn More</h2>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="Project Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="hero-description">
          © 2024 Heart Rate Monitoring System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default About;
