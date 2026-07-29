import { colors } from "../../styles/colors";

export default function Card({ children }) {
  return (
    <div
      style={{
        padding: "20px",
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        background: "white",
        marginBottom: "15px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}
