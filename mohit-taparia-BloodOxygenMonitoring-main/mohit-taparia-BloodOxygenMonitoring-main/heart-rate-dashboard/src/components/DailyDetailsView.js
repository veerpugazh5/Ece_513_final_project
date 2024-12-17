import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "../Styling/DailyDetailsView.css";
import axios from "axios";
import apiLinks from "../utils/apilinks";

function DailyDetailsView({ selectedDay, onBack }) {
  const [dailyData, setDailyData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDailyDetails = async () => {
      try {
        const response = await axios.get(apiLinks.sensorDailyDetails, {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: selectedDay },
        });
        setDailyData(response.data || []);
      } catch (error) {
        console.error("Error fetching daily details:", error);
        alert("Failed to fetch daily details.");
      }
    };
    fetchDailyDetails();
  }, [token, selectedDay]);

  const timeLabels = dailyData.map((data) => new Date(data.timestamp).toLocaleTimeString());
  const heartRateData = dailyData.map((data) => data.heartRate);
  const spo2Data = dailyData.map((data) => data.spo2);

  return (
    <div className="daily-details-view">
      <button onClick={onBack}>Back</button>
      <h2>Details for {selectedDay}</h2>
      <div className="chart-container">
        <Line
          data={{
            labels: timeLabels,
            datasets: [
              {
                label: "Heart Rate (bpm)",
                data: heartRateData,
                borderColor: "red",
                fill: false,
              },
              {
                label: "SpO2 (%)",
                data: spo2Data,
                borderColor: "blue",
                fill: false,
              },
            ],
          }}
          options={{
            scales: {
              x: { title: { display: true, text: "Time of Day" } },
              y: { title: { display: true, text: "Measurement" } },
            },
          }}
        />
      </div>
    </div>
  );
}

export default DailyDetailsView;