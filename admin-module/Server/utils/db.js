import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const conn = mysql2.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vitalsoft_db",
  port: process.env.DB_PORT || 3306
});

conn.connect(function (err) {
  if (err) {
    console.log("Database connection error: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

export default conn;
