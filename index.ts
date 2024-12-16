import dotenv from "dotenv"
dotenv.config()

import app from "./src/app"

const PORT = process.env.PORT || 5500

app.listen(PORT, function () {
  console.log("Server running on port", PORT)
})