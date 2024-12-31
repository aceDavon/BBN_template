import { IChat } from "types/chatTypes"
import ChatRoom from "./chatRoom"

class ChatUser {
  private room: ChatRoom
  private _send
  name: string | null

  constructor(send: (data: string) => void, public roomName: string) {
    this._send = send
    this.room = ChatRoom.get(roomName) as ChatRoom
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
      text: `${chatUser} joined ${this.room.name}`,
    })
  }

  handleChat(data: string) {
    const { text, type } = JSON.parse(data) as IChat
    this.room.broadcast({
      text,
      type,
      name: this.name as string
    })
  }

  handlePrivateChat(data: string) {
    const { text, type } = JSON.parse(data) as IChat

    const user = this.room.getMember(this.name as string) as ChatUser
    user.send(JSON.stringify({ text, type, name }))
  }

  handleMessage(data: string) {
    const { type, name } = JSON.parse(data) as IChat

    if (type === "join") this.handleJoin(name as string)
    else if (type === "chat") this.handleChat(data)
    else if (type === "privatechat") this.handlePrivateChat(data)
    else throw new Error(`Invalid chat type: ${type}`)
  }
}

export default ChatUser
