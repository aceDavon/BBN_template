import path from "path"
import express from "express"
import expressWs from "express-ws"
import ChatUser from "src/services/chat/chatUser"

const router = express.Router()
expressWs(express()).applyTo(router)

router.ws("/msg/:roomName", function (ws, req, next) {
  try {
    const user = new ChatUser(ws.send.bind(ws), req.params.roomName)

    ws.on("message", function (data: string) {
      try {
        user.handleMessage(data)
      } catch (err) {
        console.error(err)
      }
    })

    // ws.on("close", function () {
    //   try {
    //     user.handleClose()
    //   } catch (err) {
    //     console.error(err)
    //   }
    // })
  } catch (err) {
    console.error(err)
  }
})

router.get("/:roomName", (req, res) => {
  const htmlPath = path.resolve(__dirname, "../services/chat/chat.html")
  res.sendFile(htmlPath)
})

export default router
