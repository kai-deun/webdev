import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUser] = useState([]);
  const [roles, setRoles] = useState([]);

  // get the id value and return the role name
  const getRolename = (id) => {
    const get_role = roles.find((the_role) => the_role.role_id === id);
    return get_role ? get_role.role_name : id;
  };

  const formatBirthdate = (value) => {
    if (!value) return "";
    const convert = String(value);
    return convert.slice(0, 10);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/user_management")
      .then((res) => {
        if (res.data) {
          setUser(res.data);
        } else {
          alert(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/roles")
      .then((res) => setRoles(res.data || []))
      .catch(() => setRoles([]));
  }, []);

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>List of Users</h3>
      </div>
      <Link to="/dashboard/add_user" className="btn btn-success">
        Add User
      </Link>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Birthdate</th>
              <th>Address</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((e) => (
              <tr key={e.user_id || e.username}>
                <td>{e.username}</td>
                <td>{e.email}</td>
                <td>
                  {e.first_name} {e.last_name}
                </td>
                <td>{e.phone_number}</td>
                <td>{formatBirthdate(e.date_of_birth)}</td>
                <td>{e.address}</td>
                <td>{getRolename(e.role_id)}</td>
                <td>{e.status}</td>
                <td>
                  <Link to={`/dashboard/edit_user/${e.user_id}`} className="btn btn-info btn-sm">Edit</Link>
                  <button className="btn btn-warning btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
