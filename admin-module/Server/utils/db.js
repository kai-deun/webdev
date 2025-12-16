import mysql2 from "mysql2";

const conn = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "host_12345",
  database: "vitalsoft_db"
});

conn.connect(function (err) {
  if (err) {
    console.log("Database connection error");
  } else {
    console.log("Connected to the database");
  }
});

export default conn;
