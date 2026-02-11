require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")

const app = express()
app.use(cors())
app.use(express.json())

// Connect PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  /*สร้างไฟล์ .env ลงในโฟลเดอร์นี้
  แล้วใส่โค้ดนี้ลงไปในไฟล์ .env
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=2580
  DB_NAME=todo_db
  DB_PORT=5432*/
  
})

// ทดสอบเชื่อมต่อ DB
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ Database connection error:", err))


// GET all todos
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC")
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body
    const result = await pool.query(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      [title]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM todos WHERE id = $1", [id])
    res.json({ message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// UPDATE todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    const result = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
