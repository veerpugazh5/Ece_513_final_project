import React, { useState } from "react";
import axios from "axios";
import "../Styling/MeasurementControls.css";
import apiLinks from "../utils/apilinks";

function MeasurementControls({ initialRange, initialFrequency }) {
  const [timeRange, setTimeRange] = useState(initialRange);
  const [frequency, setFrequency] = useState(initialFrequency);
  const token = localStorage.getItem("token");

  const handleSaveSettings = async () => {
    try {
      await axios.post(apiLinks.updateMeasurementFrequency, {
        timeRange,
        frequency,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Settings updated successfully.");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    }
  };

  return (
    <div className="measurement-controls">
      <h2>Measurement Settings</h2>
      <div>
        <label>Time Range:</label>
        <input
          type="text"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          placeholder="e.g., 08:00-20:00"
        />
      </div>
      <div>
        <label>Frequency (minutes):</label>
        <input
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          min={1}
        />
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
}

export default MeasurementControls;