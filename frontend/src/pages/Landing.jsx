import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7f9fc",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Page title */}
        <h1 style={{ marginBottom: "20px", color: "#333" }}>
          Welcome to TIC platform
        </h1>

        {/* Short description */}
        <p style={{ marginBottom: "30px", color: "#666", fontSize: "16px" }}>
          Access your lectures, subjects, profile, and more.
        </p>

        {/* Login & Register buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Login button */}
          <Link to="/login">
            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "0.2s",
              }}
            >
              Login
            </button>
          </Link>

          {/* Register button */}
          <Link to="/register">
            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "0.2s",
              }}
            >
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
