import express, { response } from "express";
import conn from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  console.log(req.body);

  const sql =
    "SELECT u.* FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.email = ? AND r.role_name = ? AND u.status = 'active'";

  conn.query(sql, [req.body.email, "Admin"], async (err, result) => {
    if (err)
      return res.json({
        loginStatus: false,
        Error: err?.message || "Query syntax not working",
      });

    if (result.length > 0) {
      const user = result[0];
      const incoming = String(req.body.password || "");
      const stored = String(user.password_hash || "");

      let ok = false;

      try {
        if (/^\$2[aby]\$/.test(stored)) {
          const compat = stored.replace(/^\$2y\$/, "$2b$");
          ok = await bcrypt.compare(incoming, compat);
        } else {
          ok = incoming === stored;
        }
      } catch {
        ok = false;
      }

      if (!ok) {
        return res.json({ loginStatus: false, Error: "Wrong credentials" });
      }

      const token = jwt.sign(
        { role: "Admin", email: user.email, id: user.user_id },
        "jwt_secret_key_samp",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000
      });

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
      return res
        .status(500)
        .json({ Status: false, Error: "Password hashing failed" });
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
        return res
          .status(500)
          .json({ Status: false, Error: "Failed to add user" });
      }
      return res.json({ Status: true, user_id: result.insertId });
    });
  });
});

router.get("/user_management", (req, res) => {
  const sql = "SELECT * FROM users WHERE status='active'";
  conn.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to get users" });
    }
    res.json(rows);
  });
});

// get or read a specific user based on the id
router.get("/edit_user/:id", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM users WHERE user_id = ?";
  conn.query(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to get user information" });
    }
    res.json(rows);
  });
});

// edit a specific user based on their id
router.put("/edit_user/:id", (req, res) => {
  const id = req.params.id;

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

  const commonValues = [
    username,
    email,
    parseInt(role, 10),
    first_name,
    last_name,
    phone_number || null,
    date_of_birth || null,
    address || null,
    id,
  ];

  if (password && String(password).length > 0) {
    // hash new password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res
          .status(500)
          .json({ Status: false, Error: "Password hashing failed" });
      }

      // then update the user info
      const sql =
        "UPDATE users SET username = ?, email = ?, password_hash = ?, role_id = ?, first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?, address = ? WHERE user_id = ?";

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
        id,
      ];
      conn.query(sql, values, (qErr) => {
        if (qErr) {
          return res
            .status(500)
            .json({ Status: false, Error: "Failed to update user" });
        }
        return res.json({ Status: true });
      });
    });
  } else {
    const sql =
      "UPDATE users SET username = ?, email = ?, role_id = ?, first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?, address = ? WHERE user_id = ?";
    conn.query(sql, commonValues, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ Status: false, Error: "Failed to update user" });
      }
      return res.json({ Status: true });
    });
  }
});

router.delete("/delete_user/:id", (req, res) => {
  const id = req.params.id;
  const roleQuery =
    "SELECT r.role_name FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?";

  conn.query(roleQuery, [id], (roleErr, roleRows) => {
    if (roleErr) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to know user role" });
    }

    const roleName = roleRows?.[0]?.role_name;

    if (roleName === "Doctor") {
      const presCountSql =
        "SELECT COUNT(*) AS cnt FROM prescriptions WHERE doctor_id = ? AND status IN ('active', 'open', 'pending')";
      conn.query(presCountSql, [id], (presErr, presRows) => {
        if (presErr) {
          return res
            .status(500)
            .json({
              Status: false,
              Error: "Failed to check doctor prescriptions",
            });
        }

        const cnt = presRows?.[0]?.cnt ?? 0;
        if (cnt > 0) {
          return res.status(409).json({
            Status: false,
            Error:
              "Doctor has assigned prescriptions. Contact doctor to finish outstanding prescriptions.",
            Code: "HAS_PRESCRIPTIONS",
            Count: cnt,
          });
        }

        const deactivateQuery =
          "UPDATE users SET status = 'deactivated' WHERE user_id = ?";
        conn.query(deactivateQuery, [id], (deactErr) => {
          if (deactErr) {
            return res
              .status(500)
              .json({ Status: false, Error: "Failed to deactivate user" });
          }
          return res.json({ Status: true });
        });
      });

    } else {
      const sql = "UPDATE users SET status = 'deactivated' WHERE user_id = ?";
      conn.query(sql, [id], (err) => {
        if (err) {
          return res
            .status(500)
            .json({ Status: false, Error: "Failed to delete user" });
        }
        return res.json({ Status: true });
      });
    }
  });
});

// counts
router.get("/admin_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS admin FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.status = 'active' AND r.role_name = ?";
  conn.query(sql, ["Admin"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin count" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/doctor_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS doctor FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.status = 'active' AND r.role_name = ?";
  conn.query(sql, ["Doctor"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin count" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/patient_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS patient FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.status = 'active' AND r.role_name = ?";
  conn.query(sql, ["Patient"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin count" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/pharmacist_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS pharmacist FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.status = 'active' AND r.role_name = ?";
  conn.query(sql, ["Pharmacist"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin count" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/manager_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS pharmacy_manager FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.status = 'active' AND r.role_name = ?";
  conn.query(sql, ["Pharmacy Manager"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin count" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/adminOver", (req, res) => {
  const sql =
    "SELECT u.username, u.email FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE r.role_name = ?";
  conn.query(sql, ["Admin"], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "Failed to fetch admin lists" });
    }
    return res.json({ Status: true, Result: rows });
  });
});

router.get("/logout", (req, res) => {
  // clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  return res.json({ Status: true });
});

export { router as adminRouter };
