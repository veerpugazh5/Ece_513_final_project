import React, { useState } from "react";
import WeeklySummaryView from "../components/WeeklySummaryView";
import DailyDetailsView from "../components/DailyDetailsView";
import "../Styling/PatientDashboard.css";

function PatientDashboard() {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="patient-dashboard">
      {!selectedDay ? (
        <>
          <WeeklySummaryView onSelectDay={setSelectedDay} />
        </>
      ) : (
        <DailyDetailsView selectedDay={selectedDay} onBack={() => setSelectedDay(null)} />
      )}
    </div>
  );
}

export default PatientDashboard;