import express, { response } from "express";
import conn from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  console.log(req.body);

  const sql = "SELECT * FROM users WHERE email = ? AND password_hash = ?";

  conn.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err)
      return res.json({
        loginStatus: false,
        Error: "Query err",
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

export { router as adminRouter };
