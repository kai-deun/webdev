import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [doctorTotal, setDoctorTotal] = useState(0);
  const [patientTotal, setPatientTotal] = useState(0);
  const [pharmacistTotal, setPharmacistTotal] = useState(0);
  const [managerTotal, setManagerTotal] = useState(0);
  const [adminDisplay, setAdminDisplay] = useState([]);

  const AdminOverview = () => {
    axios
      .get("http://localhost:3000/auth/adminOver")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          setAdminDisplay(result.data.Result);
        }
      })
      .catch(() => setAdminDisplay([]));
  };

  const adminCount = () => {
    axios
      .get("http://localhost:3000/auth/admin_count")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          const row = result.data.Result[0] || {};
          setAdminTotal(row.admin || 0);
        }
      })
      .catch(() => setAdminTotal(0));
  };

  const doctorCount = () => {
    axios
      .get("http://localhost:3000/auth/doctor_count")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          const row = result.data.Result[0] || {};
          setDoctorTotal(row.doctor || 0);
        }
      })
      .catch(() => setDoctorTotal(0));
  };

  const patientCount = () => {
    axios
      .get("http://localhost:3000/auth/patient_count")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          const row = result.data.Result[0] || {};
          setPatientTotal(row.patient || 0);
        }
      })
      .catch(() => setPatientTotal(0));
  };

  const pharmacistCount = () => {
    axios
      .get("http://localhost:3000/auth/pharmacist_count")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          const row = result.data.Result[0] || {};
          setPharmacistTotal(row.pharmacist || 0);
        }
      })
      .catch(() => setPharmacistTotal(0));
  };

  const managerCount = () => {
    axios
      .get("http://localhost:3000/auth/manager_count")
      .then((result) => {
        if (
          result.data &&
          result.data.Status &&
          Array.isArray(result.data.Result)
        ) {
          const row = result.data.Result[0] || {};
          setManagerTotal(row.pharmacy_manager || 0);
        }
      })
      .catch(() => setManagerTotal(0));
  };

  useEffect(() => {
    adminCount();
    doctorCount();
    patientCount();
    pharmacistCount();
    managerCount();
    AdminOverview();
  }, []);

  return (
    <div>
      <div className="p-3 row g-3 mt-3">
        <div className="px-3 pt-2 pb-3 border shadow-sm col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="text-center pb-1">
            <h4>Admins</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total: {adminTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="text-center pb-1">
            <h4>Doctors</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total: {doctorTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="text-center pb-1">
            <h4>Patients</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total: {patientTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="text-center pb-1">
            <h4>Pharmacy Manager</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total: {managerTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="text-center pb-1">
            <h4>Pharmacists</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total: {pharmacistTotal}</h5>
          </div>
        </div>
      </div>
      <div className="mt-4 px-5 pt-3">
        <h3>Admin Overview</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {adminDisplay.map((e) => (
              <tr key={e.username || e.email}>
                <td>{e.username}</td>
                <td>{e.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
