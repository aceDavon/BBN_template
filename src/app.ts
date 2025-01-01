import express from "express"

import chatRoutes from "./routes/chatRoutes"
import expressWs from "express-ws"

const app = express()
const wsInstance = expressWs(app)
app.use(express.json())

app.use("/chat", chatRoutes)

export default app
