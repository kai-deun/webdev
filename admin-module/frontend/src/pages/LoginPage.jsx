import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {} from "..services/authService";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPass] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");
  const navigate = useNavigate;

  const handleLogin = async (e) => {
    e.prevalentDefault();
    setLoading(true);
    setErr("");

    try {
      await login(username, password);
      navigate("/users");
    } catch (err) {
      setErr(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>VitalSoft Admin</h1>
        <p>Management System</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in" : "Login"}
          </button>
        </form>

        <div className="demo-info">
          <p>Demo: suadmin / su12345 (from the db)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
