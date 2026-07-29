import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import Error from "../components/ui/Error";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send login request to backend
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Save user and token in AuthContext
      login(res.data.data, res.data.token);

      // Redirect to main page
      navigate("/mainpage");
    } catch (err) {
      // Display backend error message
      setError(err.response?.data?.message || "Login failed");
    } finally {
      // Stop loading state
      setLoading(false);
    }
  };

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
          maxWidth: "400px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Page title */}
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#333",
          }}
        >
          Login
        </h2>

        {/* Error message */}
        {error && <Error message={error} />}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
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
              marginTop: "10px",
              transition: "0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader /> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Input styling
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "15px",
};
