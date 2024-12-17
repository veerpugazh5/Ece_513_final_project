// src/routes/PatientService.js
import axios from "axios";

// Base URL for your backend server
const BASE_URL = "https://headers-gossip-paintings-authentic.trycloudflare.com/patient"; // Ensure your backend server is running on port 3000

const PatientService = {
  register: async (patientData) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, patientData);
      return response.data; // Return the success message or registered patient data
    } catch (error) {
      throw error.response?.data || error.message; // Handle errors
    }
  },

  login: async (loginData) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, loginData);
      return response.data; // Return token and patient data
    } catch (error) {
      throw error.response?.data || error.message; // Handle errors
    }
  },

  getDetails: async (email) => {
    try {
      const response = await axios.get(`${BASE_URL}/getdetails`, {
        params: { email },
      });
      return response.data; // Return patient details
    } catch (error) {
      throw error.response?.data || error.message; // Handle errors
    }
  },
};

export default PatientService;