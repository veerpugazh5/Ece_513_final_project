import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-annotation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import apiLinks from "../utils/apilinks";
import "../Styling/PatientSummaryView.css";

function PatientSummaryView({ patient, onBack }) {
  const [dailyData, setDailyData] = useState([]);
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(endDate.getDate() - 6))
  );

  // States for Device Configuration
  const [deviceStartTime, setDeviceStartTime] = useState("");
  const [deviceEndTime, setDeviceEndTime] = useState("");
  const [deviceFrequency, setDeviceFrequency] = useState(10);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          email: patient.patientEmail,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        };

        const response = await axios.post(
          apiLinks.sensorWeeklySummary,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawData = response.data.dailyData || [];
        setDailyData(rawData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again.");
      }
    };

    const fetchDeviceConfig = async () => {
      try {
        const response = await axios.get(
          apiLinks.getDeviceConfig,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { startTime, endTime, frequency } = response.data;
        setDeviceStartTime(startTime);
        setDeviceEndTime(endTime);
        setDeviceFrequency(frequency);
      } catch (error) {
        console.error("Error fetching device configuration:", error);
      }
    };

    fetchData();
    fetchDeviceConfig();
  }, [patient.patientEmail, startDate, endDate, token]);

  const handleUpdateConfig = async () => {
    try {
      const payload = {
        email: patient.patientEmail,
        startTime: deviceStartTime,
        endTime: deviceEndTime,
        frequency: deviceFrequency,
      };

      await axios.post(apiLinks.updateDeviceConfig, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Device configuration updated successfully!");
    } catch (error) {
      console.error("Error updating device configuration:", error);
      alert("Failed to update device configuration. Please try again.");
    }
  };

  return (
    <div className="patient-summary-view">
      <div className="header-section">
        <h2>{patient.patientName}'s Summary</h2>
        {/* Date Selector */}
        <div className="date-selector">
          <div className="date-picker">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
            />
          </div>
          <div className="date-picker">
            <label>End Date: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={startDate}
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="graphs-container">
        <div className="graph-section">
          <Line
            data={{
              labels: dailyData.map((data) => data.date),
              datasets: [
                {
                  label: "Heart Rate (bpm)",
                  data: dailyData.map((data) => parseFloat(data.heartRate)),
                  borderColor: "rgba(255, 99, 132, 1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{ responsive: true, title: { display: true, text: "Heart Rate" } }}
          />
        </div>
        <div className="graph-section">
          <Line
            data={{
              labels: dailyData.map((data) => data.date),
              datasets: [
                {
                  label: "SpO2 (%)",
                  data: dailyData.map((data) => parseFloat(data.spo2)),
                  borderColor: "rgba(54, 162, 235, 1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{ responsive: true, title: { display: true, text: "SpO2 Levels" } }}
          />
        </div>
      </div>

      {/* Device Configuration Form */}
      <div className="device-config-form">
        <h3>Device Configuration</h3>
        <div className="device-config-fields">
          <div className="time-field">
            <label>Start Time: </label>
            <input
              type="time"
              value={deviceStartTime}
              onChange={(e) => setDeviceStartTime(e.target.value)}
            />
          </div>

          <div className="time-field">
            <label>End Time: </label>
            <input
              type="time"
              value={deviceEndTime}
              onChange={(e) => setDeviceEndTime(e.target.value)}
            />
          </div>

          <div className="frequency-field">
            <label>Frequency (minutes): </label>
            <select
              value={deviceFrequency}
              onChange={(e) => setDeviceFrequency(parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </div>
        </div>
        <button onClick={handleUpdateConfig}>Update</button>
      </div>

      <div className="back-button-container">
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default PatientSummaryView;
