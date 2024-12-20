import { IChat } from "types/chatTypes"
import ChatRoom from "./chatRoom"

class ChatUser {
  private _send
  name: string | null

  constructor(
    send: (data: string) => void,
    public roomName: string,
    private room: ChatRoom
  ) {
    this._send = send
    this.room = room
    this.name = null
  }

  send(data: string) {
    this._send(data)
  }

  handleJoin(chatUser: string) {
    this.name = chatUser
    this.room.join(this)
    this.room.broadcast({
      type: "note",
      message: `${chatUser} joined ${this.room.name}`,
    })
  }

  handleChat(data: string) {
    const { message, type, name } = JSON.parse(data) as IChat
    this.room.broadcast({
      message,
      type,
      name,
    })
  }

  handlePrivateChat(data: string) {
    const { message, type, name } = JSON.parse(data) as IChat

    const user = this.room.getMember(name as string) as ChatUser
    user.send(JSON.stringify({ message, type, name }))
  }

  handleMessage(data: string) {
    const { type } = JSON.parse(data) as IChat

    if (type === "join") this.handleJoin(data)
    else if (type === "chat") this.handleChat(data)
    else if (type === "privatechat") this.handlePrivateChat(data)
    else throw new Error(`Invalid chat type: ${type}`) 
  }
}

export default ChatUser
