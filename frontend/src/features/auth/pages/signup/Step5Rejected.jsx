import { useLocation, useNavigate } from "react-router-dom";

export default function Step5Rejected() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const reason = state?.reason || "No reason provided";

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
          padding: "35px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "15px", color: "#b30000" }}>
          Account Rejected
        </h2>

        <p style={{ color: "#555", marginBottom: "20px" }}>
          Unfortunately, your account has been rejected.
        </p>

        <p
          style={{
            background: "#ffe6e6",
            padding: "12px",
            borderRadius: "6px",
            color: "#b30000",
            marginBottom: "25px",
            fontWeight: "bold",
          }}
        >
          Reason: {reason}
        </p>

        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "12px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            width: "100%",
          }}
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}
