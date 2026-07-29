import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

import Loader from "../components/ui/Loader";
import Error from "../components/ui/Error";
import EmptyState from "../components/ui/EmptyState";
import Card from "../components/ui/Card";

export default function AllLectures() {
  const { token } = useContext(AuthContext);

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get("/lectures", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLectures(res.data.data);
      } catch (err) {
        console.log("AllLectures error:", err);
        setError("Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>📖 All Lectures</h1>

      {lectures.length === 0 ? (
        <EmptyState
          title="No lectures found"
          message="There are no lectures available yet."
        />
      ) : (
        <div style={{ marginTop: "20px" }}>
          {lectures.map((lec) => (
            <Card key={lec._id}>
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {lec.title}
              </h3>

              <p style={{ margin: "0 0 8px 0", color: "#777" }}>
                {lec.description}
              </p>

              <p style={{ margin: 0, color: "#555" }}>
                <strong>Subject:</strong> {lec.subject?.name}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
