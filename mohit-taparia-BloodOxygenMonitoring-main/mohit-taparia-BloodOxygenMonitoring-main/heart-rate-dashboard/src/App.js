// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import AccountPage from './components/AccountPage';
import PhysicianAccountPage from './components/PhysicianAccountPage';
import DeviceRegistration from './components/DeviceRegistration';
import Layout from './components/Layout';
import Home from './components/Home';
import DetailedView from "./components/DetailedView";
import Contact from "./components/contact";
import About from './components/About';
import PatientDashboard from './pages/PatientDashboard'; // Import Patient Dashboard
import PatientView from './components/PatientView';
import PhysicianDashboard from './pages/PhysicianDashboard';
import SensorVisualization from "./pages/SensorVisualization";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login and Registration without navigation */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/contact" element={<Contact />} />

        {/* Home and About pages without Layout */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Pages wrapped with Layout for navigation */}
        <Route
          path="/AccountPage"
          element={
            <Layout>
              <AccountPage />
            </Layout>
          }
        />
        <Route
          path="/device-registration"
          element={
            <Layout>
              <DeviceRegistration />
            </Layout>
          }
        />
        <Route
          path="/physician-account"
          element={
            <Layout>
              <PhysicianAccountPage />
            </Layout>
          }
        />
        <Route
          path="/patients-view"
          element={
            <Layout>
              <PatientView />
            </Layout>
          }
        />
        <Route
          path="/physician-dashboard"
          element={
            <Layout>
              <PhysicianDashboard />
            </Layout>
          }
        />

        {/* Patient Dashboard Route */}
        <Route
          path="/patient-dashboard"
          element={
            <Layout>
              <PatientDashboard />
            </Layout>
          }
        />

        <Route
          path="/detailed-view"
          element={
            <Layout>
              <DetailedView />
            </Layout>
          }
        />
        <Route path="/sensor-visualization" element={<Layout><SensorVisualization /></Layout>} />

        {/* Default to Home Page */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;