import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styling/AccountPage.css';
import apiLinks from '../utils/apilinks';

function AccountPage() {
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    assignedPhysician: '',
  });

  const [physicians, setPhysicians] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        if (!email || !token) {
          alert('User not authenticated. Please log in again.');
          return;
        }

        const response = await axios.get(apiLinks.patientDetails, {
          headers: { Authorization: `Bearer ${token}` },
          params: { email },
        });

        const { name, dob, address, assignedPhysician, ...rest } = response.data;

        const [firstName, lastName] = name?.split(' ') || ['', ''];
        const formattedDob = dob ? new Date(dob).toISOString().split('T')[0] : '';

        setUserDetails({
          ...rest,
          firstName,
          lastName,
          dob: formattedDob,
          address: address || { street: '', city: '', state: '', zip: '' },
          assignedPhysician: assignedPhysician || '',
        });

        setSelectedPhysician(assignedPhysician || '');
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details.');
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(apiLinks.getAllPhysicians, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhysicians(response.data);
      } catch (error) {
        console.error('Error fetching physicians:', error);
        alert('Failed to fetch physicians.');
      }
    };

    fetchPhysicians();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address')) {
      const [parent, child] = name.split('.');
      setUserDetails({
        ...userDetails,
        [parent]: { ...userDetails[parent], [child]: value },
      });
    } else {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        apiLinks.patientUpdate,
        {
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          address: userDetails.address,
          assignedPhysician: selectedPhysician,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const assignedPhysicianName = physicians.find(
        (physician) => physician._id === selectedPhysician
      )?.name;

      setUserDetails((prev) => ({
        ...prev,
        assignedPhysician: assignedPhysicianName || 'None',
      }));

      alert('Account details and physician updated successfully!');
    } catch (error) {
      console.error('Error updating details:', error);
      alert('Failed to update details.');
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Account Details */}
        <div className="account-details">
          <h2>Account Details</h2>
          <form>
            <div className="row">
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={userDetails.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={userDetails.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className='email'>Email:</label>
            <input type="email" value={userDetails.email} readOnly />

            <label>Date of Birth:</label>
            <input type="date" value={userDetails.dob} readOnly />

            <label className='phone'>Phone:</label>
            <input type="text" value={userDetails.phone} readOnly />

            <h3 className='address'>Address</h3>
            <label className='street'>Street:</label>
            <input
              type="text"
              name="address.street"
              value={userDetails.address.street}
              onChange={handleChange}
            />

            <div className="row">
              <div>
                <label>City:</label>
                <input
                  type="text"
                  name="address.city"
                  value={userDetails.address.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>State:</label>
                <input
                  type="text"
                  name="address.state"
                  value={userDetails.address.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className='zip'>ZIP Code:</label>
            <input
              type="text"
              name="address.zip"
              value={userDetails.address.zip}
              onChange={handleChange}
            />

            <label>Your Physician:</label>
            <select
              value={selectedPhysician}
              onChange={(e) => setSelectedPhysician(e.target.value)}
            >
              <option value="">-- Select a Physician --</option>
              {physicians.map((physician) => (
                <option key={physician._id} value={physician._id}>
                  {physician.name}
                </option>
              ))}
            </select>

            <button className="save-button" type="button" onClick={handleSave}>
              Save
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="change-password small-form">
          <h2>Change Password</h2>
          <form>
            <label>Current Password:</label>
            <input type="password" name="currentPassword" onChange={handlePasswordChange} />

            <label>New Password:</label>
            <input type="password" name="newPassword" onChange={handlePasswordChange} />

            <label>Confirm New Password:</label>
            <input type="password" name="confirmPassword" onChange={handlePasswordChange} />

            <button className="change-password-button" type="button" onClick={() => alert('Password Changed!')}>
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;