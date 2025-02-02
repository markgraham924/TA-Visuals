import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StaffingEditor from "./components/StaffingEditor";
import StaffingChart from "./components/StaffingChart";

const App = () => {
  return (
    <Router>
      <div>
        {/* Top Navbar */}
        <nav style={styles.navbar}>
          <h1 style={styles.title}>Master Staffing</h1>
          <div style={styles.navLinks}>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/editor" style={styles.link}>Staff Editor</Link>
            <Link to="/chart" style={styles.link}>Staffing Chart</Link>
          </div>
        </nav>

        {/* App Content */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<StaffingEditor />} />
            <Route path="/chart" element={<StaffingChart />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Simple Home Page Component
const Home = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>Welcome to the Master Staffing App</h2>
    <p>Navigate to the Staff Editor or Staffing Chart using the menu above.</p>
  </div>
);

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px 20px",
  },
  title: {
    margin: 0,
  },
  navLinks: {
    display: "flex",
    gap: "15px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  content: {
    padding: "20px",
  },
};

export default App;
