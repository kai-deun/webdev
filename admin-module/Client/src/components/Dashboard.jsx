import React from "react";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect } from "react";

export const Dashboard = () => {
  const nav = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const handleLogout = () => {
    axios.get(import.meta.env.VITE_API_URL + "/auth/logout").then((res) => {
      if (res.data.Status) {
        localStorage.removeItem("valid");
        nav("/auth/adminlogin");
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <div className="d-flex flex-column align-items align-items-sm-start px-3 pt-2 text_white min-vh-100">
            <Link
              to="/dashboard"
              className="d-flex flex-column align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
                VitalSoft
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-0 align-middle"
                >
                  {/* <i></i> for icons */}
                  <span className="ms-2 d-none d-sm-inline">
                    Main Dashboard
                  </span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/user_management"
                  className="nav-link text-white px-0 align-middle"
                >
                  <span className="ms-2 d-none d-sm-inline">
                    All User Management
                  </span>
                </Link>
              </li>
              {/*               <li className="w-100">
                <Link
                  to="/dashboard/pharmacy_branch_management"
                  className="nav-link text-white px-0 align-middle"
                >
                  <span className="ms-2 d-none d-sm-inline">
                    Pharmacy Branch Management
                  </span>
                </Link>
              </li> */}
              {/*               <li className="w-100">
                <Link
                  to="/dashboard/profile"
                  className="nav-link text-white px-0 align-middle"
                >
                  <span className="ms-2 d-none d-sm-inline">Profile</span>
                </Link>
              </li> */}
              <li className="w-100" onClick={handleLogout}>
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-0 align-middle"
                >
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col p-0 m-0">
          <div className="p-2 d-flex justify-content-center shadow">
            <h4>ADMIN Management System</h4>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
