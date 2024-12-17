import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import apiLinks from "../utils/apilinks";
import "../Styling/DetailedView.css";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DetailedView = () => {
  const [devices, setDevices] = useState([]); // List of devices under the patient
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dailyDetails, setDailyDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email"); // Retrieve email from localStorage

  // Fetch devices for the logged-in patient
  useEffect(() => {
    const fetchPatientDevices = async () => {
      try {
        const response = await axios.post(
          apiLinks.getDevice,
          { email }, // Send email as part of the request payload
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(email);
        setDevices(response.data.devices || []);
      } catch (error) {
        console.error("Error fetching devices:", error);
        alert("Failed to fetch devices. Please try again.");
      }
    };

    if (email) fetchPatientDevices();
    else alert("User email not found. Please log in again.");
  }, [token, email]);

  // Fetch device data
  const fetchDeviceData = async (deviceSerialNumber) => {
    try {
      const response = await axios.post(
        apiLinks.getPatientDeviceReadings,
        { deviceSerialNumber, email }, // Send email with the request
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { readings } = response.data;
      setDailyDetails(readings || []);
    } catch (error) {
      console.error("Error fetching device data:", error);
      alert("Failed to fetch device data.");
    }
  };

  // Filter data by selected date
  const filteredDetails = dailyDetails.filter((detail) => {
    const detailDate = new Date(detail.timestamp).toDateString();
    return detailDate === selectedDate.toDateString();
  });

  // Prepare chart data
  const heartRateData = {
    labels: filteredDetails.map((detail) =>
      new Date(detail.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Heart Rate (bpm)",
        data: filteredDetails.map((detail) => detail.heart_rate),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const spO2Data = {
    labels: filteredDetails.map((detail) =>
      new Date(detail.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "SpO2 (%)",
        data: filteredDetails.map((detail) => detail.spo2),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const graphOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title },
    },
  });

  return (
    <div className="detailed-view-container">
      <h2>Detailed Device View</h2>

      {/* Device Selection */}
      <div className="filter-section">
        <label>Select Device: </label>
        <select
          onChange={(e) => {
            const selected = devices.find(
              (device) => device.serialNumber === e.target.value
            );
            setSelectedDevice(selected);
            fetchDeviceData(selected.serialNumber);
          }}
        >
          <option value="">Select a Device</option>
          {devices.map((device) => (
            <option key={device.serialNumber} value={device.serialNumber}>
              {device.deviceName} - {device.serialNumber}
            </option>
          ))}
        </select>

        {/* Date Picker */}
        <label>Date: </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
        />
      </div>

      {/* Display Charts */}
      {selectedDevice && (
        <div className="graphs-container">
          <div className="graph-section">
            <Line
              data={heartRateData}
              options={graphOptions("Heart Rate (bpm)")}
            />
          </div>
          <div className="graph-section">
            <Line data={spO2Data} options={graphOptions("SpO2 (%)")} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedView;