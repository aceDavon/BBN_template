import { CookieOptions, Request, Response } from "express"
import AuthService from "../app/features/auth"
import { validateArrayProperties } from "src/utils/handlers/propertyValidation"

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    if (!validateArrayProperties([username, password]))
      throw new Error("Missing credentials")

    await AuthService.register(username, password)
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json({ error: message })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!validateArrayProperties([username, password]))
      throw new Error("Missing credentials")

    const token = await AuthService.login(username, password)
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    }

    res.cookie("token", token, cookieOptions)
    res.status(200).json({ success: true })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json({ error: message })
  }
}
