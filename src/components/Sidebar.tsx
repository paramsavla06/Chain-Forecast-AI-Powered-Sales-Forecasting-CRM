import { Link } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">ChainForecast</h2>

      <nav>
        <Link to="/app/forecast">📈 Forecast</Link>
        <Link to="/app/crm">👥 CRM</Link>
        <Link to="/app/offers">🎁 Offers</Link>
        <Link to="/app/logs">🧾 Logs</Link>
        <Link to="/app/admin">⚙️ Admin</Link>
      </nav>
    </div>
  );
}
