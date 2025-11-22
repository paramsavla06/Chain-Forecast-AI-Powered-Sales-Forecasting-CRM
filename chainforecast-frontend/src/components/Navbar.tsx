import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="app-navbar">
      <div className="nav-title">Dashboard</div>

      <div
        className="nav-profile"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="nav-profile-info">
          <span className="nav-profile-name">Retailer Demo</span>
          <span className="nav-profile-role">Admin</span>
        </div>
        <div className="nav-avatar">RD</div>

        {open && (
          <div className="nav-dropdown">
            <button>Profile</button>
            <button>Settings</button>
            <button>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
