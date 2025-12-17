import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { adminRouter } from "./routes/AdminRoute.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "true" ? true : (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173", "http://localhost:80", "http://localhost"]),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", adminRouter);

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "jwt_secret_key_samp", (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Invalid Token" });

      req.id = decoded.id;
      req.role = decoded.role;

      next();
    });
  } else {
    return res.json({ Status: false, Error: "Not valid" });
  }
};

app.get("/verify", verifyUser, (req, res) => {
  return res.json({Status: true, role: req.role, id: req.id})
});

app.listen(3000, () => {
  console.log("Server running");
});
