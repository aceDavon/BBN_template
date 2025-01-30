import express from "express"
import multer from "multer"
import cookieParser from "cookie-parser"

import chatRoutes from "./routes/chatRoutes"
import authRoutes from "./routes/auth/authRoutes"
import expressWs from "express-ws"

const app = express()
const wsInstance = expressWs(app)
const upload = multer()
app.use(upload.any())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/chat", chatRoutes)
app.use("/auth", authRoutes)

export default app
