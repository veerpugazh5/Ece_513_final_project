import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiLinks from '../utils/apilinks'; // Import API links
import '../Styling/PhysicianAccountPage.css';

function PhysicianAccountPage() {
  const [physicianDetails, setPhysicianDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch physician details from the backend
  useEffect(() => {
    const fetchPhysicianDetails = async () => {
      try {
        const email = localStorage.getItem('email'); // Retrieve email from localStorage
        const token = localStorage.getItem('token'); // Retrieve token for authorization
        console.log('Debug: Fetching physician details for email:', email);

        if (!email || !token) {
          alert('User not authenticated. Please log in again.');
          return;
        }

        const response = await axios.get(apiLinks.physicianDetails, {
          headers: { Authorization: `Bearer ${token}` },
          params: { email },
        });

        const { name, phone, specialization, qualifications } = response.data;

        const [firstName, lastName] = name?.split(' ') || ['', ''];

        setPhysicianDetails({
          firstName,
          lastName,
          email,
          phone: phone || '',
          specialization: specialization || '',
          qualifications: qualifications || '',
        });
      } catch (error) {
        console.error('Error fetching physician details:', error);
        alert('Failed to fetch physician details.');
      }
    };

    fetchPhysicianDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in passwords) {
      setPasswords({ ...passwords, [name]: value });
    } else {
      setPhysicianDetails({ ...physicianDetails, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        apiLinks.physicianUpdate,
        {
          email: physicianDetails.email,
          firstName: physicianDetails.firstName,
          lastName: physicianDetails.lastName,
          specialization: physicianDetails.specialization,
          qualifications: physicianDetails.qualifications,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Physician details updated successfully!');
    } catch (error) {
      console.error('Error updating physician details:', error);
      alert('Failed to update physician details.');
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        apiLinks.physicianResetPassword,
        {
          email: physicianDetails.email,
          currentPassword,
          newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password.');
    }
  };

  return (
    <div className="physician-account-page">
      <div className="details-section">
        <h2>Physician Account Details</h2>
        <form>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={physicianDetails.firstName || ''}
            onChange={handleChange}
          />

          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={physicianDetails.lastName || ''}
            onChange={handleChange}
          />

          <label>Email:</label>
          <input type="email" value={physicianDetails.email || ''} readOnly />

          <label>Phone:</label>
          <input type="text" value={physicianDetails.phone || ''} readOnly />

          <label>Specialization:</label>
          <input
            type="text"
            name="specialization"
            value={physicianDetails.specialization || ''}
            onChange={handleChange}
          />

          <label>Qualifications:</label>
          <input
            type="text"
            name="qualifications"
            value={physicianDetails.qualifications || ''}
            onChange={handleChange}
          />

          <button type="button" onClick={handleSave}>
            Save
          </button>
        </form>
      </div>

      <div className="password-section">
        <h2>Change Password</h2>
        <form>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
          />

          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
          />

          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
          />

          <button type="button" onClick={handlePasswordChange}>
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PhysicianAccountPage;