import React, { useState } from 'react';
import axios from 'axios';
import apiLinks from '../utils/apilinks';
import { useNavigate } from 'react-router-dom';
import '../Styling/Registration.css'; // Updated CSS path

function Registration() {
  const navigate = useNavigate();
  const [role, setRole] = useState('Physician'); // Default role set to Physician
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '', // Added field for re-typing the password
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    dob: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    specialization: '',
    qualifications: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(''); // Password strength indicator
  const [showPasswordConditions, setShowPasswordConditions] = useState(false);
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
  });


  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      dob: '',
      address: { street: '', city: '', state: '', zip: '' },
      specialization: '',
      qualifications: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });

      // Check password strength dynamically
      if (name === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
        validatePasswordConditions(value);
        setPasswordStrength(checkPasswordStrength(value));
      }
    }
  };

  const validatePasswordConditions = (password) => {
    setPasswordConditions({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
    });
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password))
      return 'Strong';
    return 'Moderate';
  };

  const handlePasswordBlur = () => {
    setShowPasswordConditions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Concatenate firstName and lastName into name
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
      };

      // Select endpoint based on role
      const endpoint =
        role === 'Patient' ? apiLinks.patientRegister: apiLinks.physicianRegister;

      // Post data to backend
      const response = await axios.post(endpoint, payload);

      alert(response.data.message || `${role} registration successful!`);

      // Navigate to Login Page after successful registration
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || `${role} registration failed.`);
    }
  };

  return (
    <div className="registration-page">
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

      <div className="registration-container">
        <h2>{role} Registration</h2>
        <div className="role-toggle">
          <label>
            <input
              type="radio"
              value="Patient"
              checked={role === 'Patient'}
              onChange={handleRoleChange}
            />
            Patient
          </label>
          <label>
            <input
              type="radio"
              value="Physician"
              checked={role === 'Physician'}
              onChange={handleRoleChange}
            />
            Physician
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="row-fields">
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordConditions(true)}
                onBlur={handlePasswordBlur}
                required
              />
              {showPasswordConditions && (
              <div className="password-conditions">
                <p>Password must have:</p>
                <ul>
                  <li style={{ color: passwordConditions.length ? 'green' : 'red' }}>
                    At least 6 characters
                  </li>
                  <li style={{ color: passwordConditions.uppercase ? 'green' : 'red' }}>
                    At least 1 uppercase letter
                  </li>
                  <li style={{ color: passwordConditions.lowercase ? 'green' : 'red' }}>
                    At least 1 lowercase letter
                  </li>
                  <li style={{ color: passwordConditions.digit ? 'green' : 'red' }}>
                    At least 1 digit
                  </li>
                </ul>
              </div>
          )}
            <small>Password Strength: {passwordStrength}</small>
              <label>Re-type Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row-fields">
            <div>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {role === 'Patient' && (
            <>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />

              <h3>Address</h3>
              <div className="row-fields">
                <div>
                  <label>Street:</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>City:</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="row-fields">
                <div>
                  <label>State:</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>ZIP Code:</label>
                  <input
                    type="text"
                    name="address.zip"
                    value={formData.address.zip}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {role === 'Physician' && (
            <>
              <label>Specialization:</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />

              <label>Qualifications (comma-separated):</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button type="submit" className="register-button">
            Register
          </button>
        </form>

        <button onClick={() => navigate('/login')} className="login-button">
          Existing User? Login Here
        </button>
      </div>
    </div>
  );
}

export default Registration;