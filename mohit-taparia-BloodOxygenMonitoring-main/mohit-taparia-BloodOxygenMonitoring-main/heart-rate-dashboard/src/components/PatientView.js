import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import apiLinks from "../utils/apilinks";
import "../Styling/PatientView.css";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PatientView() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dailyDetails, setDailyDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(""); // Start time filter
  const [endTime, setEndTime] = useState(""); // End time filter
  const token = localStorage.getItem("token");

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(apiLinks.getPatientsdetails, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Failed to fetch patients.");
      }
    };
    fetchPatients();
  }, [token]);

  // Fetch daily stats
  const fetchDailyDetails = async (deviceSerialNumber, email) => {
    try {
      const response = await axios.post(
        apiLinks.getPatientDailyDetails,
        { deviceSerialNumber, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { startTime, endTime, readings } = response.data;

      // Set default filters based on backend response
      setStartTime(startTime || "06:00");
      setEndTime(endTime || "22:00");

      setDailyDetails(readings || []);
    } catch (error) {
      console.error("Error fetching daily details:", error);
      alert("Failed to fetch daily details.");
    }
  };

  // Filter data by date and time
  const filteredDetails = dailyDetails.filter((detail) => {
    const detailDate = new Date(detail.timestamp).toDateString();
    const detailTime = new Date(detail.timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      detailDate === selectedDate.toDateString() &&
      detailTime >= startTime &&
      detailTime <= endTime
    );
  });

  // Heart Rate Line Chart Data
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

  // SpO2 Line Chart Data
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

  // Combined Bar Chart Data
  const combinedBarData = {
    labels: filteredDetails.map((detail) =>
      new Date(detail.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Heart Rate (bpm)",
        data: filteredDetails.map((detail) => detail.heart_rate),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "SpO2 (%)",
        data: filteredDetails.map((detail) => detail.spo2),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
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
    <div className="patient-view-container">
      {/* Section 1: Patient Names */}
      <div className="section1">
        <h3>Assigned Patients</h3>
        {patients?.length > 0 ? (
          <ul className="patient-list">
            {patients.map((patient) => (
              <li
                key={patient._id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setSelectedDevice(null);
                  setDailyDetails([]);
                }}
                className={`patient-item ${
                  selectedPatient?._id === patient._id ? "selected" : ""
                }`}
              >
                {patient.name} - {patient.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients assigned.</p>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedPatient && (
          <div className="section2">
            <div>
              <h3>Filter by Date</h3>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
              />
            </div>

            <div className="device-row">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="device-row">
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div>
              <h3>Sensor</h3>
              {selectedPatient.devices?.length > 0 ? (
                <select
                  onChange={(e) => {
                    const device = selectedPatient.devices.find(
                      (d) => d.serialNumber === e.target.value
                    );
                    setSelectedDevice(device);
                    fetchDailyDetails(device.serialNumber, selectedPatient.email);
                  }}
                >
                  <option value="">Select Device</option>
                  {selectedPatient.devices.map((device) => (
                    <option key={device._id} value={device.serialNumber}>
                      {device.deviceName} - {device.serialNumber}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No devices registered.</p>
              )}
            </div>
          </div>
        )}

        {/* Line Graphs */}
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

        {/* Combined Bar Graph */}
        {selectedDevice && (
          <div className="combined-bar-section">
            <Bar
              data={combinedBarData}
              options={graphOptions("Heart Rate & SpO2 Combined")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientView;