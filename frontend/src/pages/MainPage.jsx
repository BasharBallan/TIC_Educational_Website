import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fc" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h1 style={{ marginBottom: "20px", color: "#333" }}>Dashboard</h1>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            maxWidth: "450px",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", color: "#444" }}>
            Welcome, {user.name}
          </h2>

          <p style={{ margin: "0 0 20px 0", color: "#777" }}>
            You are logged in as <strong>{user.role}</strong>.
          </p>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "0.2s",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
