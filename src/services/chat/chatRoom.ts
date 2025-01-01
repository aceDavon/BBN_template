import { IChat } from "types/chatTypes"
import ChatUser from "./chatUser"

const rooms = new Map<string, ChatRoom>()

class ChatRoom {
  name: string
  private members: Set<ChatUser>

  static get(roomName: string) {
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new ChatRoom(roomName))
    }

    return rooms.get(roomName)
  }

  constructor(roomName: string) {
    this.name = roomName
    this.members = new Set()
  }

  join(chatUser: ChatUser) {
    this.members.add(chatUser)
  }

  leave(chatUser: ChatUser) {
    this.members.delete(chatUser)
  }

  broadcast(data: IChat) {
    for (const member of this.members) {
      member.send(JSON.stringify(data))
    }
  }

  getMembers() {
    return this.members
  }

  getMember(memberName: string) {
    for (const member of this.members) {
      if (member.name === memberName) return member
      return new Error(`No chat User with the Identifier: ${memberName}`)
    }
  }
}

export default ChatRoom
