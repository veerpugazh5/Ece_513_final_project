import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styling/DeviceRegistration.css';
import apiLinks from '../utils/apilinks';

function DeviceRegistration() {
  const [deviceDetails, setDeviceDetails] = useState({
    deviceName: '',
    serialNumber: '',
  });

  const [registeredDevices, setRegisteredDevices] = useState([]); // State to store registered devices

  // Fetch registered devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const response = await axios.get(apiLinks.getRegisteredDevices, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegisteredDevices(response.data.devices);
      } catch (error) {
        console.error('Error fetching devices:', error);
        alert('Failed to fetch devices.');
      }
    };

    fetchDevices();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeviceDetails({ ...deviceDetails, [name]: value });
  };

  // Handle device registration
  const handleRegister = async () => {
    if (!deviceDetails.deviceName || !deviceDetails.serialNumber) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        apiLinks.deviceRegister,
        { ...deviceDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Device registered successfully!');
      setDeviceDetails({ deviceName: '', serialNumber: '' }); // Reset form

      // Refresh the registered devices list
      const response = await axios.get(apiLinks.getRegisteredDevices, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegisteredDevices(response.data.devices);
    } catch (error) {
      console.error('Error registering device:', error);
      alert('Failed to register device.');
    }
  };

  // Handle device deletion by serial number
  const handleDelete = async (serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete the device with Serial Number: ${serialNumber}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(apiLinks.deleteDevice, {
        headers: { Authorization: `Bearer ${token}` },
        data: { serialNumber }, // Sending serial number as request body
      });

      alert('Device deleted successfully.');

      // Refresh the registered devices list
      setRegisteredDevices((prev) =>
        prev.filter((device) => device.serialNumber !== serialNumber)
      );
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Failed to delete device.');
    }
  };

  return (
    <div className="device-registration-container">
      <h2>Setup Heartrate Measurement Device</h2>

      {/* Device Registration Form */}
      <div className="device-form">
        <div className="device-row">
          <label>Device Name</label>
          <input
            type="text"
            name="deviceName"
            value={deviceDetails.deviceName}
            onChange={handleChange}
            placeholder="Enter device name"
          />
        </div>
        <div className="device-row">
          <label>Device Serial Number</label>
          <input
            type="text"
            name="serialNumber"
            value={deviceDetails.serialNumber}
            onChange={handleChange}
            placeholder="Enter serial number"
          />
        </div>
        <div className="device-row">
          <button onClick={handleRegister} className="register-button">
            Register Device
          </button>
        </div>
      </div>

      {/* Registered Devices Table */}
      <div className="registered-devices">
        <h3>Registered Devices</h3>
        {registeredDevices.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registeredDevices.map((device) => (
                <tr key={device.serialNumber}>
                  <td>{device.deviceName}</td>
                  <td>{device.serialNumber}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(device.serialNumber)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No devices registered yet.</p>
        )}
      </div>
    </div>
  );
}

export default DeviceRegistration;