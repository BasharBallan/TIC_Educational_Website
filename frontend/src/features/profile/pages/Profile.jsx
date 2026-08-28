import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";

import Loader from "../../../components/ui/Loader";
import Error from "../../../components/ui/Error";
import Card from "../../../components/ui/Card";

export default function Profile() {
  const { token } = useContext(AuthContext);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/getMe", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(res.data.data);
        console.log("USER DATA:", res.data.data);

      } catch (err) {
        console.log("Profile error:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  if (!userData) return <Error message="Could not load profile." />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>👤 Profile</h1>

      <Card>
        {/* Profile Image */}
        {userData.profileImg && (
          <img
            src={`http://localhost:8000/users/${userData.profileImg}`}
            alt="Profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "10px",
              objectFit: "cover",
              marginBottom: "15px",
            }}
          />
        )}

        <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{userData.name}</h2>

        <p style={{ margin: "0 0 8px 0", color: "#555" }}>
          <strong>Email:</strong> {userData.email}
        </p>

        <p style={{ margin: "0 0 8px 0", color: "#555" }}>
          <strong>Role:</strong> {userData.role}
        </p>

        {/* Student Data */}
        {userData.role === "student" && (
          <div style={{ marginTop: "15px" }}>
            <h3 style={{ marginBottom: "10px", color: "#333" }}>🎓 Student Info</h3>

            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              <strong>Student Number:</strong> {userData.phone}
            </p>

            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              <strong>Year:</strong> {userData.studentData?.year?.name}
            </p>

            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              <strong>Semester:</strong> {userData.studentData?.semester?.name}
            </p>

            {/* Subjects */}
            {userData.studentData?.subjects?.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Subjects:</strong>
                <ul>
                  {userData.studentData.subjects.map((subj) => (
                    <li key={subj._id}>{subj.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Doctor Data */}
        {userData.role === "doctor" && (
          <div style={{ marginTop: "15px" }}>
            <h3 style={{ marginBottom: "10px", color: "#333" }}>🩺 Doctor Info</h3>

            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              <strong>Specialization:</strong> {userData.doctorData?.specialization}
            </p>

            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              <strong>Academic Title:</strong> {userData.doctorData?.academicTitle}
            </p>

            {/* Doctor Subjects */}
            {userData.doctorData?.subjects?.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Subjects:</strong>
                <ul>
                  {userData.doctorData.subjects.map((subj) => (
                    <li key={subj._id}>{subj.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
