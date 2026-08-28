import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";

import Loader from "../../../components/ui/Loader";
import Error from "../../../components/ui/Error";
import EmptyState from "../../../components/ui/EmptyState";
import Card from "../../../components/ui/Card";

export default function SubjectLectures() {
  const { token } = useContext(AuthContext);
  const { subjectId } = useParams();

  const [lectures, setLectures] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get(`/lectures/subject/${subjectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLectures(res.data.data);

        // إذا الـ backend بيرجع subject داخل كل lecture
        if (res.data.data.length > 0) {
          setSubjectName(res.data.data[0].subject?.name || "");
        }
      } catch (err) {
        console.log("SubjectLectures error:", err);
        setError("Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [subjectId, token]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>
        📖 Lectures — {subjectName || "Subject"}
      </h1>

      {lectures.length === 0 ? (
        <EmptyState
          title="No lectures found"
          message="This subject has no lectures yet."
        />
      ) : (
        <div style={{ marginTop: "20px" }}>
          {lectures.map((lec) => (
            <Card key={lec._id}>
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {lec.title}
              </h3>

              <p style={{ margin: "0 0 8px 0", color: "#777" }}>
                {lec.description || "No description"}
              </p>

              {lec.fileUrl && (
                <a
                  href={lec.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    style={{
                      marginTop: "10px",
                      padding: "10px 16px",
                      background: "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: "500",
                      transition: "0.2s",
                    }}
                  >
                    Open Lecture
                  </button>
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
