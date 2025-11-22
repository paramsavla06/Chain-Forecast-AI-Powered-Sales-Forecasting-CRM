import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-navbar">
      <div>Dashboard</div>
      <button
        onClick={handleLogout}
        style={{
          padding: "6px 10px",
          borderRadius: "4px",
          border: "1px solid #ddd",
          background: "white",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
