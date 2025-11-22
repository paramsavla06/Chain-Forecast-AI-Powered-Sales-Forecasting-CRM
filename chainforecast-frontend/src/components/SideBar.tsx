import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div>
        <div className="sidebar-brand">ChainForecast</div>
        <div className="sidebar-tagline">AI Sales &amp; CRM Insights</div>

        <nav className="sidebar-nav">
          <NavLink
            to="/forecast"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/crm"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="icon">👥</span>
            <span>CRM Rules</span>
          </NavLink>

          <NavLink
            to="/offers"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="icon">🎁</span>
            <span>Offers</span>
          </NavLink>

          <NavLink
            to="/logs"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="icon">🧾</span>
            <span>Logs</span>
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="icon">⚙️</span>
            <span>Admin</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">© {new Date().getFullYear()} ChainForecast</div>
    </aside>
  );
}
