import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styling/Layout.css';

const menuConfig = {
  Patient: [
    { label: 'Account', path: '/AccountPage' },
    { label: 'Device Registration', path: '/device-registration' },
    { label: 'Patient Dashboard', path: '/patient-dashboard' },
    { label: "Detailed View", path: "/detailed-view" }, // Replaced Sensor Visualization
    { label: 'Logout', action: 'logout' },
  ],
  Physician: [
    { label: 'Physician Account', path: '/physician-account' },
    { label: 'Summary View', path: '/physician-dashboard' },
    { label: 'Detailed Summary View', path: '/sensor-visualization' },
    { label: 'Logout', action: 'logout' },
  ],
};

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'Patient'; // Default to Patient if no role is passed
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!['Patient', 'Physician'].includes(role)) {
      navigate('/'); // Redirect to home if role is invalid
    }
  }, [role, navigate]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.clear();
      navigate('/');
    }
  };

  const renderMenu = (role) => (
    <ul>
      {menuConfig[role].map((item, index) =>
        item.action === 'logout' ? (
          <li key={index} onClick={handleLogout}>{item.label}</li>
        ) : (
          <li
            key={index}
            className={location.pathname === item.path ? 'active' : ''}
            onClick={() => {
              setIsNavOpen(false); // Close sidebar on smaller screens
              navigate(item.path, { state: { role } });
            }}
          >
            {item.label}
          </li>
        )
      )}
    </ul>
  );

  return (
    <div className="layout-container">
      <div
        className="hamburger-icon"
        onClick={toggleNav}
        aria-label="Toggle navigation"
        role="button"
        tabIndex={0}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
      <nav className={`sidebar ${isNavOpen ? 'open' : ''}`}>
        <h3>{role === 'Patient' ? 'Patient Menu' : 'Physician Menu'}</h3>
        {renderMenu(role)}
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;