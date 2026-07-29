function UserCard(props) {
  // Extract values from props for easier usage
  const { name, email, role } = props;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px",
      }}
    >
      {/* Display user name */}
      <h3>{name}</h3>

      {/* Display user email */}
      <p>Email: {email}</p>

      {/* Display user role */}
      <p>Role: {role}</p>
    </div>
  );
}

export default UserCard;
