import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

import api from "../../../api/axios";

import Loader from "../../../components/ui/Loader";
import Error from "../../../components/ui/Error";
import EmptyState from "../../../components/ui/EmptyState";
import Card from "../../../components/ui/Card";

export default function Favorites() {
  const { token } = useContext(AuthContext);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get("/saved-lectures", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFavorites(res.data.data);
      } catch (err) {
        console.log("Favorites error:", err);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>⭐ Favorites</h1>

      {favorites.length === 0 ? (
        <EmptyState
          title="No saved lectures"
          message="You haven't saved any lectures yet."
        />
      ) : (
        <div style={{ marginTop: "20px" }}>
          {favorites.map((lec) => (
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
