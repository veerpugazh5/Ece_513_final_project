import React, { useEffect, useState } from "react";
import axios from "axios";
import apiLinks from "../utils/apilinks"; // Import apiLinks
import "../Styling/AllPatientsList.css";

function WeeklySummaryView() {
  const [patientData, setPatientData] = useState([]); // Weekly data for the logged-in patient
  const token = localStorage.getItem("token"); // Token for authorization
  //const email = localStorage.getItem("email"); // Retrieve logged-in patient's email

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          apiLinks.getAssignedPatients, // Correct API endpoint
        //  { email }, // Send logged-in patient email to fetch data
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Extract the "results" array from the response
        setPatientData(response.data.results || []);
      } catch (error) {
        console.error("Error fetching weekly summary:", error);
        alert("Failed to fetch weekly summary.");
      }
    };

    fetchPatients();
  }, [token]);

  return (
    <div className="all-patients-list">
      <h2>Weekly Summary</h2>
      {patientData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>7-Day Avg</th>
              <th>Max Heart Rate</th>
              <th>Min Heart Rate</th>
            </tr>
          </thead>
          <tbody>
            {patientData.map((patient, index) => {
                const stats = patient.stats?.[0];
              return (
                <tr key={index}>
                  <td>{patient.patientEmail}</td>
                  <td>{stats ? parseFloat(stats.averageHeartRate).toFixed(2) : "N/A"}</td>
                  <td>{stats ? stats.maxHeartRate.toFixed(2) : "N/A"}</td>
                  <td>{stats ? stats.minHeartRate.toFixed(2) : "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No data available for this week.</p>
      )}
    </div>
  );
}

export default WeeklySummaryView;