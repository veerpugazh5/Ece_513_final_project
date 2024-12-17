import React, { useState } from "react";
import AllPatientsList from "../components/AllPatientsList";
import PatientSummaryView from "../components/PatientSummaryView";
import "../Styling/PhysicianDashboard.css";

function PhysicianDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="physician-dashboard">
      {!selectedPatient ? (
        <AllPatientsList onSelectPatient={setSelectedPatient} />
      ) : (
        <PatientSummaryView
          patient={selectedPatient}
          onBack={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

export default PhysicianDashboard;