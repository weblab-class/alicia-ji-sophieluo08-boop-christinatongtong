import express from "express"
import cors from "cors"

const app = express()
const PORT = 5050

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "backend alive 🔥" })
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
