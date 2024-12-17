import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styling/contact.css";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="references-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Heart Rate Monitoring System</div>
        <nav>
          <ul>
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/about")}>About</li>
            <li onClick={() => navigate("/contact")}>Contact</li>
          </ul>
        </nav>
      </header>

      {/* References Section */}
      <section className="references-container">
        <h1 className="references-title">Project References</h1>

        <div className="reference-section">
          <h2>Frontend Framework and Libraries</h2>
          <ul>
            <li className ="reference-item">
              <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                React
              </a>
              <span> JavaScript library for building user interfaces</span>
            </li>
            <li className ="reference-item">
              <a href="https://particles.js.org" target="_blank" rel="noopener noreferrer">
                Particles.js
              </a>
              <span> Used for creating particle animations in the background</span>
            </li>
          </ul>
        </div>

        <div className="reference-section">
          <h2>Hardware Components</h2>
          <ul>
            <li className ="reference-item">
              SpO2 Sensor - Used for measuring blood oxygen saturation levels
              <ul className ="reference-item">
                <li>Sensor Documentation and Specifications</li>
                <li>Integration Libraries and Drivers</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="reference-section">
          <h2>Server and Domain Services</h2>
          <ul>
            <li className ="reference-item">
              <a href="https://www.nginx.com" target="_blank" rel="noopener noreferrer">
                NGINX
              </a>
              <span> - Web server used for hosting the application</span>
            </li>
            <li className ="reference-item">
              <a href="https://www.duckdns.org" target="_blank" rel="noopener noreferrer">
                DuckDNS
              </a>
              <span> - Free dynamic DNS service for domain management</span>
            </li>
          </ul>
        </div>

        <div className="reference-section">
          <h2>Security Certificates</h2>
          <ul>
            <li className ="reference-item">
              SSL Certificates
              <ul className ="reference-item">
                <li>Certificate Authority details</li>
                <li>Implementation for HTTPS encryption</li>
                <li>Security protocols and standards</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="reference-section">
          <h2>Code Examples and Resources</h2>
          <ul>
            <li className ="reference-item">
              <a href="https://docs.nginx.com" target="_blank" rel="noopener noreferrer">
                NGINX Documentation
              </a>
              <span> - Server configuration and setup guides</span>
            </li>
            <li className ="reference-item">
              <a href="https://reactjs.org/docs" target="_blank" rel="noopener noreferrer">
                React Documentation
              </a>
              <span> - Official React documentation and tutorials</span>
            </li>
            <li className ="reference-item">
              Project Documentation
              <span> - Custom implementation details and configurations</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Heart Rate Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;