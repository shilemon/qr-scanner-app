const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// ✅ Allow all origins (important for Vercel)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// ✅ RDS Connection
const db = mysql.createConnection({
  host: "scanner-db.crygmg0qymcz.ap-south-1.rds.amazonaws.com",
  user: "admin",
  password: "Emon1234",
  database: "scanner_db",
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.error("❌ DB connection error:", err);
  } else {
    console.log("✅ Connected to RDS");
  }
});

// 👉 Save scan
app.post("/api/scan", (req, res) => {
  const { value, type } = req.body;

  if (!value) return res.status(400).send("No value");

  const sql = "INSERT INTO scans (value, type) VALUES (?, ?)";
  db.query(sql, [value, type], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.json({ message: "Saved" });
  });
});

// 👉 Get history
app.get("/api/history", (req, res) => {
  db.query("SELECT * FROM scans ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error");
    }
    res.json(result);
  });
});

// Start server
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});