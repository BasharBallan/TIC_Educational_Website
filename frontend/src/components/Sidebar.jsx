import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const doctorLinks = [
    { to: "/profile", label: "📄 Profile" },
    { to: "/addLecture", label: "➕ Add Lecture" },
    { to: "/notifications", label: "🔔 All Notifications" },
    { to: "/settings/notifications", label: "⚙️ Notification Settings" },
  ];

  const studentLinks = [
    { to: "/main", label: "🏠 Home" },
    { to: "/profile", label: "📄 Profile" },
    { to: "/favorites", label: "⭐ Favorites" },
    { to: "/lectures", label: "📚 All Lectures" },
    { to: "/subjects", label: "📚 All Subjects" },
    { to: "/chat", label: "💬 Student Chat" },
    { to: "/notifications", label: "🔔 All Notifications" },
    { to: "/settings/notifications", label: "⚙️ Notification Settings" },
  ];

  const adminLinks = [
    { to: "/main", label: "🏠 Dashboard" },
    { to: "/profile", label: "📄 Profile" },
    { to: "/users", label: "👥 Manage Users" },
    { to: "/subjects", label: "📚 Manage Subjects" },
    { to: "/lectures", label: "📚 Manage Lectures" },
    { to: "/notifications", label: "🔔 All Notifications" },
    { to: "/settings/notifications", label: "⚙️ Notification Settings" },
  ];

  let linksToShow = [];

  if (user?.role === "doctor") linksToShow = doctorLinks;
  else if (user?.role === "student") linksToShow = studentLinks;
  else if (user?.role === "admin") linksToShow = adminLinks;

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "#ffffff",
        padding: "25px",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        animation: "sidebarFade 0.5s ease",
      }}
    >
      <h3
        style={{
          marginBottom: "35px",
          fontSize: "20px",
          fontWeight: "600",
          color: "#2c3e50",
          animation: "slideDown 0.6s ease",
        }}
      >
        👤 {user?.name}
      </h3>

      <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
        {linksToShow.map((item, index) => (
          <li key={index} style={{ marginBottom: "18px" }}>
            <Link
              to={item.to}
              style={{
                textDecoration: "none",
                color: "#34495e",
                fontSize: "16px",
                fontWeight: "500",
                padding: "10px 12px",
                display: "block",
                borderRadius: "8px",
                transition: "0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ecf0f1";
                e.currentTarget.style.transform = "translateX(6px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={handleLogout}
        style={{
          padding: "12px 20px",
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
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#e74c3c";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Logout
      </button>

      <style>
        {`
          @keyframes sidebarFade {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
