export default function EmptyState({
  title = "No data found",
  message = "There is nothing to show here yet.",
}) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.icon}>📭</div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.msg}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "50px 0",
    display: "flex",
    justifyContent: "center",
  },
  box: {
    textAlign: "center",
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    padding: "30px 40px",
    borderRadius: "10px",
    maxWidth: "450px",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
  },
  msg: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#666",
  },
};
