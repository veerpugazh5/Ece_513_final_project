const BASE_URL = "https://sugar-dairy-viewed-treasures.trycloudflare.com"; // Base URL for the backend

const apiLinks = {
  // Authentication Endpoints
  patientLogin: `${BASE_URL}/patient/login`,
  patientRegister: `${BASE_URL}/patient/register`,
  physicianLogin: `${BASE_URL}/physician/login`,
  physicianRegister: `${BASE_URL}/physician/register`,

  // Patient API Endpoints
  patientDetails: `${BASE_URL}/patient/getdetails`,        // Fetch patient details
  patientUpdate: `${BASE_URL}/patient/update`,            // Update patient info
  patientResetPassword: `${BASE_URL}/patient/reset-password`, // Reset password for a patient

  // Physician API Endpoints
  physicianDetails: `${BASE_URL}/physician/getdetails`,   // Fetch physician details
  physicianUpdate: `${BASE_URL}/physician/update`,        // Update physician info
  physicianResetPassword: `${BASE_URL}/physician/reset-password`, // Reset password for a physician
  getAssignedPatients: `${BASE_URL}/physician/registeredpatientsstats`,
  getPatientsdetails: `${BASE_URL}/physician/patientsview`, // Fetch all assigned patients
  getPatientDailyDetails: `${BASE_URL}/physician/getdevicereadings`, 
  getPatientDeviceReadings: `${BASE_URL}/patient/getdevicereadings`, // Fetch daily device readings for a patient
  updateMeasurementFrequency: `${BASE_URL}/physician/patient/update-frequency`, // Update measurement frequency for a patient

  // Device API Endpoints
  deviceRegister: `${BASE_URL}/patient/registerparticle`, // Register a new device
  getRegisteredDevices: `${BASE_URL}/patient/getalldevices`, // Get all registered devices
  deleteDevice: `${BASE_URL}/patient/deletedevice`, 
  getDevice : `${BASE_URL}/patient/getdevices`,      // Delete a registered device

  // Sensor Data Endpoints
  sensorWeeklySummary: `${BASE_URL}/physician/patient-date-range-summary`, // Fetch weekly summary data for sensors
  sensorDailyDetails: `${BASE_URL}/sensor/daily-details`, 
  PatientsensorWeeklySummary: `${BASE_URL}/patient/patient-date-range-summary`,   

  // Miscellaneous
  getAllPhysicians: `${BASE_URL}/patient/getallphysicians`, // Get a list of all physicians
};

export default apiLinks;
