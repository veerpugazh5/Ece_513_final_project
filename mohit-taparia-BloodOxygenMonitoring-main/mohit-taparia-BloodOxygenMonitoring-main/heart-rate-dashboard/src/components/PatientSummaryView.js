import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import apiLinks from "../utils/apilinks";
import "../Styling/PatientSummaryView.css";

function PatientSummaryView({ patient, onBack }) {
  const [dailyData, setDailyData] = useState([]); // Data for graphs
  const [startDate, setStartDate] = useState(new Date()); // Default start date: today
  const [endDate, setEndDate] = useState(new Date()); // Default end date: 6 days after start
  const token = localStorage.getItem("token");

  // Update end date when start date changes
  useEffect(() => {
    const calculateEndDate = () => {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + 6); // Adjust for 7-day range
      setEndDate(newEndDate);
    };
    calculateEndDate();
  }, [startDate]);

  // Fetch data based on selected start date and end date
  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          email: patient.patientEmail,
          startDate: startDate.toISOString().split("T")[0], // Format: yyyy-mm-dd
          endDate: endDate.toISOString().split("T")[0], // Format: yyyy-mm-dd
        };

        console.log("Request Payload:", payload); // Debug the payload

        const response = await axios.post(
          apiLinks.sensorWeeklySummary,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("API Response:", response.data); // Debug the API response

        const rawData = response.data.dailyData || [];
        setDailyData(rawData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, [patient.patientEmail, startDate, endDate, token]);

  // Prepare graph data for Heart Rate
  const heartRateData = {
    labels: dailyData.map((data) => data.date),
    datasets: [
      {
        label: "Heart Rate (bpm)",
        data: dailyData.map((data) => parseFloat(data.heartRate)),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Prepare graph data for SpO2
  const spO2Data = {
    labels: dailyData.map((data) => data.date),
    datasets: [
      {
        label: "SpO2 (%)",
        data: dailyData.map((data) => parseFloat(data.spo2)),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const graphOptions = (title, yAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: yAxisLabel } },
    },
  });

  return (
    <div className="patient-summary-view">
      {/* Header Section */}
      <div className="header-section">
        <h2>{patient.patientName}'s Summary</h2>
        <div className="date-selector">
          <div className="date-picker">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()} // Disable future dates
            />
          </div>
          <div className="date-picker">
            <label>End Date: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={startDate} // Prevent end date from being before start date
              maxDate={new Date()} // Disable future dates
            />
          </div>
        </div>
      </div>

      {/* Graphs Container */}
      <div className="graphs-container">
        <div className="graph-section">
          <Line
            data={heartRateData}
            options={graphOptions("Heart Rate (bpm)", "BPM")}
          />
        </div>
        <div className="graph-section">
          <Line
            data={spO2Data}
            options={graphOptions("SpO2 (%)", "SpO2 (%)")}
          />
        </div>
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default PatientSummaryView;