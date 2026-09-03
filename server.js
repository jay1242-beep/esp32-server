const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/dbtest", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/createtable", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS moisture_data (
        id SERIAL PRIMARY KEY,
        moisture REAL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    res.send("Table created");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post("/upload", async (req, res) => {
  try {
    const { moisture } = req.body;

    await pool.query(
      "INSERT INTO moisture_data (moisture) VALUES ($1)",
      [moisture]
    );

    res.send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.get("/latest", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM moisture_data ORDER BY id DESC LIMIT 1"
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
