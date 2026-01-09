require("dotenv").config()

const express = require("express")
const cors = require("cors")
const connectDB = require("./db")

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.get("/health", (req, res) => {
  res.json({ status: "backend + mongo alive 🔥" })
})

const PORT = process.env.PORT || 5050
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend running at http://127.0.0.1:${PORT}`)
})
