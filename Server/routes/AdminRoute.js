import express, { response } from "express";
import conn from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  console.log(req.body);

  const sql = "SELECT * FROM users WHERE email = ? AND password_hash = ?";

  conn.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err)
      return res.json({
        loginStatus: false,
        Error: "Query syntax not working",
      });

    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email },
        "jwt_secret_key_samp",
        { expiresIn: "1d" }
      );

      res.cookie("token", token);

      return res.json({
        loginStatus: true,
      });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong credentials" });
    }
  });
});

// getting the roles
router.get("/roles", (req, res) => {
  const sql = "SELECT role_id, role_name FROM roles";
  conn.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch roles" });
    }
    res.json(rows);
  });
});

router.post("/add_user", (req, res) => {
  const sql =
    "INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, phone_number, date_of_birth, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const {
    username,
    email,
    password,
    role,
    first_name,
    last_name,
    phone_number,
    date_of_birth,
    address,
  } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ Status: false, Error: "Password hashing failed" });
    }

    const values = [
      username,
      email,
      hash,
      parseInt(role, 10),
      first_name,
      last_name,
      phone_number || null,
      date_of_birth || null,
      address || null,
    ];

    conn.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json({ Status: false, Error: "Failed to add user" });
      }
      return res.json({ Status: true, user_id: result.insertId });
    });
  });
});

export { router as adminRouter };
