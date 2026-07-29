import { createContext, useState, useEffect } from "react";

// Create the authentication context
export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // Stores user data
  const [token, setToken] = useState(null);      // Stores JWT token
  const [loading, setLoading] = useState(true);  // Tracks auto-login state

  // Load user and token from localStorage on first render
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser)); // Restore user data
      setToken(savedToken);           // Restore token
    }

    setLoading(false); // Auto-login finished
  }, []);

  // Login: save user and token in state + localStorage
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Logout: clear user and token from state + localStorage
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Provide authentication values to the entire app
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
