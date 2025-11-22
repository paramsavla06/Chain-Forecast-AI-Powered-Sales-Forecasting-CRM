import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="app-sidebar">
      <h2>ChainForecast</h2>
      <nav
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <NavLink to="/forecast">📈 Forecast</NavLink>
        <NavLink to="/crm">👥 CRM</NavLink>
        <NavLink to="/offers">🎁 Offers</NavLink>
        <NavLink to="/logs">🧾 Logs</NavLink>
        <NavLink to="/admin">⚙️ Admin</NavLink>
      </nav>
    </div>
  );
}
