import bcrypt from "bcrypt"
import UserRepository from "../repositories/userRepository"
import { generateToken } from "../utils/handlers/auth/jwtUtils"
import User from "../models/user"

class AuthService {
  private secretKey = process.env.JWT_SECRET || "your-secret-key"

  async register(username: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User(username, hashedPassword)
    await UserRepository.createUser(user)
  }

  async login(username: string, password: string): Promise<string> {
    const user = await UserRepository.findByUsername(username)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials")
    }
    return generateToken({ username: user.username }, this.secretKey)
  }
}

export default new AuthService()
