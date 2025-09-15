import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import VersionPanel from "./components/VersionPanel";
import "./styles/styles.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* altre pagine */}
          </Routes>
        </main>
        <VersionPanel />
      </div>
    </Router>
  );
}

export default App;
