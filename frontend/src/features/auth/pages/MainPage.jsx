import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";

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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2f7, #f7f9fc)",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "40px",
          animation: "fadeIn 0.6s ease",
        }}
      >
        <h1
          style={{
            marginBottom: "25px",
            color: "#2c3e50",
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "1px",
            animation: "slideDown 0.7s ease",
          }}
        >
          Dashboard
        </h1>

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animation: "popIn 0.7s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              color: "#34495e",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Welcome, {user.name}
          </h2>

          <p
            style={{
              margin: "0 0 25px 0",
              color: "#7f8c8d",
              fontSize: "16px",
            }}
          >
            You are logged in as <strong>{user.role}</strong>.
          </p>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c0392b";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#e74c3c";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes popIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
