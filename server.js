require("dotenv").config() // .env ใช้เพื่อเก็บsetting ค่าการเชื่อมDBไว้ในไฟล์ เพิ่มความปลอดภัย
const express = require("express") // ใช้สร้าง API Server
const cors = require("cors") // ตัวcrossเพื่อทำให้ frontend สามารถเรียกใช้งาน api backend ได้
const { Pool } = require("pg") // ใช้pool เพราะว่าจะได้ไม่ต้องมีการconnect database ใหม่ทุกครั้งที่มี request มา

const app = express() //สร้างตัวแปร app จาก express เพื่อใช้เป็นตัว API server
app.use(cors()) //ใช้อนุญาติให้ตัวหน้าเว็บที่อยู่คนละ port สามารถใช้งาน api หลังบ้านได้
app.use(express.json()) // ใช้เพื่อให้ backend อ่านข้อมูล JSON ที่ส่งมาจาก frontend ได้ 
                        // โดยจะแปลง JSON ให้เป็น object เพื่อที่จะสามารถอ่านค่าในreq.body

                        
// Connect PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  
})

// ทดสอบเชื่อมต่อ DB
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Database connection error:", err))

//req.body คือ object ที่เก็บข้อมูลจาก frontend ที่ส่งมาใน request

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

const PORT = 3000 //เปิดเซิฟเวอร์ให้รันอยู่ใน port 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
