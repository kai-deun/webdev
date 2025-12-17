import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({children}) => {
  const [status, setStatus] = useState("checking")
  const navigate = useNavigate()
  useEffect(() => {
    axios.defaults.withCredentials = true
    axios.get(import.meta.env.VITE_API_URL + "/verify")
      .then(res => {
        if (res.data && res.data.Status && res.data.role === "Admin") {
          setStatus("ok")
        } else {
          setStatus("fail")
        }
      })
      .catch(() => setStatus("fail"))
  }, [])
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "valid" && e.newValue === null) {
        navigate("/auth/adminlogin", { replace: true })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [navigate])
  if (status === "checking") return null
  return status === "ok" ? children : <Navigate to="/auth/adminlogin" replace />
}

export default ProtectedRoute
