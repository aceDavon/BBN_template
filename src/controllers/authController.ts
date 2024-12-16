import { Request, Response } from "express"
import AuthService from "../services/authService"

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    await AuthService.register(username, password)
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    res.status(400).json({ error })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    const token = await AuthService.login(username, password)
    res.status(200).json({ token })
  } catch (error) {
    res.status(401).json({ error })
  }
}
