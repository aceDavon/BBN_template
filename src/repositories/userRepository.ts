import { db } from "src/database/db"
import User from "../models/user"

class UserRepository {
  private tableName = "users"

  async createUser(user: User): Promise<void> {
    const { username, password } = user
    await db.query(
      `INSERT INTO ${this.tableName} (username, password) VALUES ($1, $2)`,
      [username, password]
    )
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.findOne(this.tableName, { username })
    return result ? (result as User) : null
  }
}

export default new UserRepository()
