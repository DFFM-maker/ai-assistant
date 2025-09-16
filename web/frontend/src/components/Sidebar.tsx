import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/versioning">Versioning</Link></li>
        {/* altre voci */}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;

