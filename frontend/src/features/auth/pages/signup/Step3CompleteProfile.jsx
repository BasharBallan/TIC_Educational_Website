import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import Error from "../../../../components/ui/Error";
import Loader from "../../../../components/ui/Loader";

export default function Step3CompleteProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [phone, setPhone] = useState("");
  const [profileImg, setprofileImg] = useState(null);
  const [universityCardImg, setuniversityCardImg] = useState(null);
  const [yearName, setYearName] = useState("");
  const [semesterName, setSemesterName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Error: No email provided</h3>
        <p>Please go back to the signup page.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("yearName", yearName);
      formData.append("semesterName", semesterName);

      // MUST match backend field names
      formData.append("profileImg", profileImg);
      formData.append("universityCardImg", universityCardImg);

      await api.post("/auth/complete-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/auth/signup/pending-approval");

    } catch (err) {
      setError(err.response?.data?.message || "Profile completion failed");
    } finally {
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
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#333",
          }}
        >
          Complete Your Profile
        </h2>

        {error && <Error message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Phone Number */}
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          {/* Profile Image */}
          <label style={labelStyle}>Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setprofileImg(e.target.files[0])}
            style={inputStyle}
          />

          {/* University ID Image */}
          <label style={labelStyle}>University ID Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setuniversityCardImg(e.target.files[0])}
            style={inputStyle}
          />

          {/* Academic Year */}
          <label style={labelStyle}>Academic Year</label>
          <select
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select year</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>

          </select>

          {/* Semester */}
          <label style={labelStyle}>Semester</label>
          <select
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select semester</option>
            <option value="1">1st semester</option>
            <option value="2">2nd semester</option>
          </select>

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
            {loading ? <Loader /> : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "15px",
};

const labelStyle = {
  marginBottom: "6px",
  marginTop: "10px",
  fontSize: "14px",
  color: "#555",
};
