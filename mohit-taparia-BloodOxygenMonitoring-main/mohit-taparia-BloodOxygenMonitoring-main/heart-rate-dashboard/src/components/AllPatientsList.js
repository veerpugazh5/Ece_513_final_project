import React, { useEffect, useState } from "react";
import axios from "axios";
import apiLinks from "../utils/apilinks"; // Import apiLinks
import "../Styling/AllPatientsList.css";

function AllPatientsList({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(apiLinks.getAssignedPatients, {
          headers: { Authorization: `Bearer ${token}` }, // Use the correct API key
        });

        // Extract the "results" array from the response
        setPatients(response.data.results || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Failed to fetch patients.");
      }
    };
    fetchPatients();
  }, [token]);

  return (
    <div className="all-patients-list">
      <h2>All Patients</h2>
      {patients.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>7-Day Avg</th>
              <th>Max</th>
              <th>Min</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => {
              // Safely handle stats
              const stats = patient.stats?.[0]; // Assuming we always take the first stats entry
              return (
                <tr key={index}>
                  <td>{patient.patientName}</td>
                  <td>{patient.patientEmail}</td>
                  <td>{stats ? parseFloat(stats.averageHeartRate).toFixed(2) : "N/A"}</td>
                  <td>{stats ? stats.maxHeartRate.toFixed(2) : "N/A"}</td>
                  <td>{stats ? stats.minHeartRate.toFixed(2) : "N/A"}</td>
                  <td>
                    <button onClick={() => onSelectPatient(patient)}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No patients found.</p>
      )}
    </div>
  );
}

export default AllPatientsList;