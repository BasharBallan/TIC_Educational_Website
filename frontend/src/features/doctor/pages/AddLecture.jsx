import { useState, useContext, useEffect } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddLecture() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [file, setFile] = useState(null);

  // Quiz fields
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  const [subjects, setSubjects] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------
  // Load subjects for this doctor
  // ------------------------------------------------------
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/doctors/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSubjects(res.data.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load subjects");
      }
    };

    fetchSubjects();
  }, []);

  // ------------------------------------------------------
  // Submit new lecture
  // ------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description || !subjectId) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("subjectId", subjectId);

      if (file) {
        formData.append("file", file);
      }

      // Quiz (optional)
      const quizObject = {
        question,
        choices,
        correctAnswerIndex,
      };

      if (question.trim() !== "") {
        formData.append("quiz", JSON.stringify([quizObject]));
      }

      await api.post("/doctors/lectures", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Lecture created successfully!");

      setTimeout(() => navigate("/mainpage"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lecture");
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
          maxWidth: "500px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#333",
          }}
        >
          ➕ Add New Lecture
        </h1>

        {error && (
          <p style={errorStyle}>{error}</p>
        )}

        {success && (
          <p style={successStyle}>{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Lecture Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Lecture Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, height: "100px" }}
          />

          {/* Subject Dropdown */}
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Subject</option>

            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* File Upload */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={inputStyle}
          />

          {/* Quiz Section */}
          <h3 style={{ marginTop: "20px", color: "#444" }}>Optional Quiz</h3>

          <input
            type="text"
            placeholder="Quiz Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={inputStyle}
          />

          {choices.map((choice, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Choice ${index + 1}`}
              value={choice}
              onChange={(e) => {
                const newChoices = [...choices];
                newChoices[index] = e.target.value;
                setChoices(newChoices);
              }}
              style={inputStyle}
            />
          ))}

          <select
            value={correctAnswerIndex}
            onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
            style={inputStyle}
          >
            <option value={0}>Correct Answer: Choice 1</option>
            <option value={1}>Correct Answer: Choice 2</option>
            <option value={2}>Correct Answer: Choice 3</option>
            <option value={3}>Correct Answer: Choice 4</option>
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
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Lecture"}
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

const errorStyle = {
  background: "#ffe6e6",
  padding: "10px",
  borderRadius: "6px",
  color: "#b30000",
  marginBottom: "15px",
  textAlign: "center",
};

const successStyle = {
  background: "#e6ffed",
  padding: "10px",
  borderRadius: "6px",
  color: "#0f8a2c",
  marginBottom: "15px",
  textAlign: "center",
};
