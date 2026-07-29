import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle logout and redirect to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#f5f5f5",
        padding: "20px",
        borderRight: "1px solid #ddd",
      }}
    >
      {/* Display logged-in user's name */}
      <h3 style={{ marginBottom: "30px" }}>👤 {user?.name}</h3>

      {/* Navigation links */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "15px" }}>
          <Link to="/main">🏠 Home</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/profile">📄 Profile</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/favorites">⭐ Favorites</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/ProfileUpdate">🖼 Update Profile Image</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/changepassword">🔐 Change Password</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/lectures">📚 Lectures</Link>
        </li>
      </ul>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
