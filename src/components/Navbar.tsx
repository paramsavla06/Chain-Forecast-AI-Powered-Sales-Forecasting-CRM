import "../styles/navbar.css";
import { UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="title">Dashboard</div>
      <div className="right">
        <UserButton />
      </div>
    </div>
  );
}
