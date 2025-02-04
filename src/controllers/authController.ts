import { CookieOptions, Request, Response } from "express"
import AuthService from "../app/features/auth"
import { validateArrayProperties } from "src/utils/handlers/propertyValidation"
import User from "src/models/user"
import { JwtPayload } from "jsonwebtoken"
import { genericError } from "src/utils/handlers/errors/genericError"

interface CustomJwtPayload extends JwtPayload {
  id: string
  username: string
}

interface AuthenticatedRequest extends Request {
  user?: CustomJwtPayload | string
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    if (!validateArrayProperties([username, password]))
      throw new Error("Missing credentials")

    await AuthService.register(username, password)
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json(genericError({ message }))
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
    res.status(400).json(genericError({ message }))
  }
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await AuthService.users()
  const usersWithoutPassword = users.map((user) => {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  })

  res.status(200).json({ users: usersWithoutPassword })
}

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const data: Partial<User> = req.body
    if (Object.keys(data).length === 0)
      throw new Error("No data provided for User updates")

    const fields = Object.keys(data)
      .map((field, idx) => `${field} = $${idx + 2}`)
      .join(", ")
    const values = Object.values(data)
    const { id } = req.user as CustomJwtPayload

    const result = await AuthService.update(fields, values, id)
    if (result === 0) throw new Error("Update failed, Try again")

    res.status(200).json({ success: true, message: "User Update successful" })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json(genericError({ message }))
  }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  res.status(200).json({ success: true, message: "Logged out successfully" })
}

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query

    const result = await AuthService.delete(userId as string)
    if (!result) throw new Error("User deletion failed, Try again")

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    const { message } = error as { message: string }
    res.status(400).json(genericError({ message }))
  }
}
