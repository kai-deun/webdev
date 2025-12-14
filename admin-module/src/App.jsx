import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Users from "./components/Users";
import Profile from "./components/Profile";
import Pharmacy_Branch from "./components/Pharmacy_Branch";
import Add_User from "./components/Add_User";
import Edit_User from "./components/Edit_User";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/adminLogin" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="" element={<Home />} />
          <Route path="/dashboard/user_management" element={<Users />} />
          <Route path="/dashboard/add_user" element={<Add_User />} />
          <Route path="/dashboard/edit_user/:id" element={<Edit_User />} />
          <Route path="/dashboard/pharmacy_branch_management" element={<Pharmacy_Branch />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
