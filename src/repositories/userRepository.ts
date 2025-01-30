import { db } from "src/database/db"
import User from "../models/user"
import { QueryResult } from "node_modules/@types/pg"

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

  async findAllUsers(): Promise<Record<string, any>[]> {
    return await db.findAll(this.tableName)
  }

  async updateUserAccount(
    fields: string,
    values: string[],
    userId: string
  ): Promise<number> {
    const query = `UPDATE ${this.tableName} SET ${fields} WHERE id = $1 RETURNING *`
    const result = await db.query<QueryResult<User> | null>(query, [
      userId,
      ...values,
    ])

    return result?.rowCount ?? 0
  }
}

export default new UserRepository()
