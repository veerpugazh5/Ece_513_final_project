import React, { useState } from "react";
import WeeklySummaryView from "../components/WeeklySummaryView";
import DailyDetailsView from "../components/DailyDetailsView";
import MeasurementControls from "../components/MeasurementControls";
import "../Styling/PatientDashboard.css";

function PatientDashboard() {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="patient-dashboard">
      {!selectedDay ? (
        <>
          <WeeklySummaryView onSelectDay={setSelectedDay} />
          <MeasurementControls initialRange="08:00-20:00" initialFrequency={10} />
        </>
      ) : (
        <DailyDetailsView selectedDay={selectedDay} onBack={() => setSelectedDay(null)} />
      )}
    </div>
  );
}

export default PatientDashboard;