import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

export default function Step2VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  if (!email) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Error: No email provided</h3>
        <p>Please go back to the signup page.</p>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/verify-email", { email, code });

      navigate("/auth/signup/complete-profile", {
        state: { email },
      });

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    setError("");

    try {
      await api.post("/auth/resend-code", { email });
      setResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify Your Email</h2>
        <p>We sent a verification code to:</p>
        <p style={{ fontWeight: "bold" }}>{email}</p>

        {error && <p className="error">{error}</p>}
        {resendMessage && <p className="success">{resendMessage}</p>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          onClick={handleResend}
          style={{ marginTop: "15px", background: "transparent", color: "#3498db" }}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
