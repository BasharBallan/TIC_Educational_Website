import { useNavigate } from "react-router-dom";

export default function Step4PendingApproval() {
  const navigate = useNavigate();

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
        <h2 style={{ marginBottom: "15px", color: "#333" }}>
          Account Under Review
        </h2>

        <p style={{ color: "#555", marginBottom: "25px" }}>
          Your profile has been submitted successfully.
          Our team is reviewing your information.
        </p>

        <p style={{ color: "#555", marginBottom: "25px" }}>
          You will receive an email once your account is approved.
        </p>

        <button
          onClick={() => navigate("/login")}
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
          Back to Login
        </button>
      </div>
    </div>
  );
}
