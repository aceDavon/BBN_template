import db from "../database/db"
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
    return db.findOne(this.tableName, { username })
  }
}

export default new UserRepository()
