require("dotenv").config()

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use("/api/auth", authRoutes)

app.get("/", (req,res)=>{
  res.send("SMART-EWS API running")
})

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT)
})