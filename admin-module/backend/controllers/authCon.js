const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and Password needed",
      });
    }

    const conn = await pool.getConnection();

    const [users] = await conn.query(
      `SELECT u.*, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.username = ?`,
      [username]
    );

    conn.release();

    if (users.length == 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const user = users[0];

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role_name,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: process.env.EXPIRE }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: "Logged out",
  });
};
