// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiLinks from '../utils/apilinks';
import '../Styling/Login.css'; // Updated CSS path

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('Patient'); // Default role selection
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Determine endpoint based on role
      const endpoint = role === 'Patient' ? apiLinks.patientLogin : apiLinks.physicianLogin;
      // Send login request to backend
      const response = await axios.post(endpoint, { email, password });

      // Save user details in localStorage
      const { token, patient, physician } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);

      alert(response.data.message || 'Login successful!');

      // Navigate to the respective account page based on role
      if (role === 'Patient') {
        navigate('/AccountPage', {
          state: {
            email: patient.email,
            role,
          },
        });
      } else {
        navigate('/physician-account', {
          state: {
            email: physician.email,
            role,
          },
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(
        error.response?.data?.message || 'Failed to log in. Please try again.'
      );
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Heart Rate Monitoring System</div>
        <nav>
          <ul>
            <li onClick={() => navigate('/')}>Home</li>
            <li onClick={() => navigate('/login')}>Login</li>
            <li onClick={() => navigate('/register')}>Register</li>
          </ul>
        </nav>
      </header>

      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          {/* Password Input */}
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {/* Role Selection */}
          <div className="role-selection">
            <label>Select Role:</label>
            <div className="role-toggle">
              <label>
                <input
                  type="radio"
                  value="Patient"
                  checked={role === 'Patient'}
                  onChange={() => setRole('Patient')}
                />
                Patient
              </label>
              <label>
                <input
                  type="radio"
                  value="Physician"
                  checked={role === 'Physician'}
                  onChange={() => setRole('Physician')}
                />
                Physician
              </label>
            </div>
          </div>

          <button className="login-button" type="submit">
            Login
          </button>
        </form>

        <button onClick={() => navigate('/register')} className="register-button">
          New User? Register Here
        </button>
      </div>
    </div>
  );
}

export default Login;