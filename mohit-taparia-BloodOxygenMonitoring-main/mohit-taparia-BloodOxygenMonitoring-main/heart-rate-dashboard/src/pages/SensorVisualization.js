import React from "react";
import PatientView from "../components/PatientView";

const SensorVisualization = () => {
  return (
    <div className="sensor-visualization-page">
      {/* Reuse the PatientView component */}
      <PatientView />
    </div>
  );
};

export default SensorVisualization;