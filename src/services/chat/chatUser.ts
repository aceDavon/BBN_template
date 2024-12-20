import { Request } from "express";
import ChatRoom from "./chatRoom";

class ChatUser {
  private _send
  name: string | null

  constructor(send: (data: string) => void, public roomName: string, private room: ChatRoom) {
    this._send = send
    this.room = room
    this.name = null
  }

  send(data: string) {
    this._send(data)
  }
}

export default ChatUser;