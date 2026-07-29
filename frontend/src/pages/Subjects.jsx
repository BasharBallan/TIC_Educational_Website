import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { Link } from "react-router-dom";

import Loader from "../components/ui/Loader";
import Error from "../components/ui/Error";
import EmptyState from "../components/ui/EmptyState";
import Card from "../components/ui/Card";

export default function Subjects() {
  const { token } = useContext(AuthContext);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/lectures/my-lectures", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const lectures = res.data.data;

        const uniqueSubjects = [];
        const seen = new Set();

        lectures.forEach((lec) => {
          if (!seen.has(lec.subject._id)) {
            seen.add(lec.subject._id);
            uniqueSubjects.push(lec.subject);
          }
        });

        setSubjects(uniqueSubjects);
      } catch (err) {
        console.log("Subjects error:", err);
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>📚 Subjects</h1>

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="You don't have any subjects yet."
        />
      ) : (
        <div style={{ marginTop: "20px" }}>
          {subjects.map((sub) => (
            <Card key={sub._id}>
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {sub.name}
              </h3>

              <Link to={`/lectures/${sub._id}`}>
                <button
                  style={{
                    marginTop: "10px",
                    padding: "10px 16px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "500",
                    transition: "0.2s",
                  }}
                >
                  View Lectures
                </button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
