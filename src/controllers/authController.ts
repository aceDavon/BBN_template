import { Request, Response } from "express"
import AuthService from "../app/features/auth"
import { validateArrayProperties } from "src/utils/handlers/propertyValidation"

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
    
    if (!validateArrayProperties([username, password])) throw new Error("Missing credentials")
    
    const token = await AuthService.login(username, password)
    res.status(200).json({ token })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json({ error: message })
  }
}
