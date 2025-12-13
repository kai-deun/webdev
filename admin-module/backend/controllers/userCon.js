const pool = require("../config/database");
const bcrypt = require("bcryptjs");

// get users from the database
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    let query = `SELECT u.user_id, u.username, u.email,
    u.first_name, u.last_name, u.phone_number, u.status, r.role_id, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.status = 'active'`;

    let count_q = 'SELECT COUNT(*) as total FROM users WHERE status = "active"';

    let params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?
        OR u.email LIKE ?)`;

      count_q += ` AND (first_name LIKE ? OR last_name LIKE ?
        OR email LIKE ?)`;

      const searching = `%${search}%`;

      params = [searching, searching, searching];
    }

    query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [users] = await conn.query(query, params);
    const [countResult] = await conn.query(count_q, params);

    conn.release();

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// get a user based on the ID
exports.getUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    const [user] = await conn.query(
      `SELECT u.*, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?`,
      [id]
    );

    conn.release();

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// CREATE function
exports.createUser = async (req, res) => {
  const {
    username,
    email,
    first_name,
    last_name,
    role_id,
    password,
    phone_number,
  } = req.body;

  try {
    if (!username || !email || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const hashPass = await bcrypt.hash(password || "password123", 10);
    const conn = await pool.getConnection();

    const [result] = await conn.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name,
      role_id, phone_number, status)
      VALUES (?,?,?,?,?,?,?, 'active')`,
      [
        username,
        email,
        hashPass,
        first_name,
        last_name,
        role_id || 5,
        phone_number,
      ]
    );

    conn.release();

    res.status(201).json({
      success: true,
      message: "Created a User",
      user_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE function
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name, phone_number, status, role_id } = req.body;

  try {
    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE users SET email = ?, first_name = ?, last_name = ?,
      phone_number = ?, status = ?, role_id = ?
      WHERE user_id = ?`,
      [email, first_name, last_name, phone_number, status || "active", role_id, id]
    );

    conn.release();

    res.json({
      success: true,
      message: "Updated user",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE or deact user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    await conn.query(
      'UPDATE users SET status = "deactivated" WHERE user_id = ?',
      [id]
    );

    conn.release();

    res.json({
      success: true,
      message: "User deactivated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// get ROLES
exports.getAllRoles = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [roles] = await conn.query("SELECT * FROM roles");

    conn.release();

    res.json({success: true, data: roles});
  } catch (error) {
    console.error('getAllRoles error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
