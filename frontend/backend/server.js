const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Replace with your RDS or local MySQL config
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // default XAMPP
  database: "scanner_db",
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to DB");
  }
});

// 👉 Save scan
app.post("/api/scan", (req, res) => {
  const { value, type } = req.body;

  const sql = "INSERT INTO scans (value, type) VALUES (?, ?)";
  db.query(sql, [value, type], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.send("Scan saved");
  });
});

// 👉 Get history
app.get("/api/history", (req, res) => {
  db.query("SELECT * FROM scans ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});