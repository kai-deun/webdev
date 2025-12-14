import React, { use, useEffect, useState } from "react";
import axios from "axios";

const Add_User = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    role: "",
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/roles")
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    axios.post('http://localhost:3000/auth/add_user', user)
    .then(result => console.log(result))
    .catch(err => console.log(err))
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center">Add User</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="username"
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-0"
              id="email"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control rounded-0"
              id="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label htmlFor="first_name" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="first_name"
              onChange={(e) => setUser({ ...user, first_name: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label htmlFor="last_name" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="last_name"
              onChange={(e) => setUser({ ...user, last_name: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label htmlFor="phone_number" className="form-label">
              Phone Number
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="phone_number"
              onChange={(e) =>
                setUser({ ...user, phone_number: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="date_of_birth" className="form-label">
              Birthdate
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="date_of_birth"
              onChange={(e) =>
                setUser({ ...user, date_of_birth: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="address"
              onChange={(e) => setUser({ ...user, address: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label htmlFor="roles" className="form-label">
              Roles
            </label>
            <select
              name="roles"
              id="roles"
              className="form-select"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            >
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_User;
