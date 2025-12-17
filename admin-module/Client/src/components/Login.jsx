import React, { useState } from "react";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [values, setVal] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [error, setErr] = useState(null);

  const handleLogin = (event) => {
    event.preventDefault();
    axios
      .post(import.meta.env.VITE_API_URL + "/auth/adminlogin", values)
      .then((result) => {
        console.log(result);
        if (result.data.loginStatus) {
          localStorage.setItem("valid", true)
          navigate("/dashboard");
        } else {
          setErr(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center 
    vh-100 loginPage"
    >
      <div className="p-3 rounded w-25 border loginForm">
        <div className="text-danger">{error && error}</div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="email@gmail.com"
              className="form-control rounded-0"
              onChange={(e) => setVal({ ...values, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setVal({ ...values, password: e.target.value })}
            />
          </div>

          <button className="btn btn-success w-100 rounded-0 buttonLog">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
