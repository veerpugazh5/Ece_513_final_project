import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "chartjs-plugin-annotation";
import apiLinks from "../utils/apilinks";
import "../Styling/AllPatientsList.css";

function WeeklySummaryView() {
  const [plotData, setPlotData] = useState([]); // Daily sensor data for heart rate and SpO2
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email"); // Retrieve the logged-in patient's email

  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        const payload = {
          email: email, // Use the logged-in patient's email here
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        };

        const response = await axios.post(apiLinks.sensorWeeklySummary, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlotData(response.data.dailyData || []);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        alert("Failed to fetch plot data.");
      }
    };

    fetchPlotData();
  }, [token, email, startDate, endDate]);

  return (
    <div className="all-patients-list">
      <h2>Weekly Heart Rate and SpO2 Trends</h2>

      {/* Display Logged-in User's Email */}
      <p><strong>Logged-in Patient Email:</strong> {email}</p>

      {/* Date Range Picker */}
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

      {/* Plots */}
      <div className="graphs-container">
        <div className="graph-section">
          <h3>Heart Rate Trends</h3>
          <Line
            data={{
              labels: plotData.map((data) => data.date),
              datasets: [
                {
                  label: "Heart Rate (bpm)",
                  data: plotData.map((data) => parseFloat(data.heartRate)),
                  borderColor: "rgba(255, 99, 132, 1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{ responsive: true, title: { display: true, text: "Heart Rate" } }}
          />
        </div>
        <div className="graph-section">
          <h3>SpO2 Trends</h3>
          <Line
            data={{
              labels: plotData.map((data) => data.date),
              datasets: [
                {
                  label: "SpO2 (%)",
                  data: plotData.map((data) => parseFloat(data.spo2)),
                  borderColor: "rgba(54, 162, 235, 1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{ responsive: true, title: { display: true, text: "SpO2 Levels" } }}
          />
        </div>
      </div>
    </div>
  );
}

export default WeeklySummaryView;
