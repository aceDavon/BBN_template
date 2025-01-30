import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken"

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key"

interface CustomJwtPayload extends JwtPayload {
  id: string
  username: string
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ message: "Token is required" })
    return
  }

  jwt.verify(
    token,
    SECRET_KEY,
    (err: VerifyErrors | null, decoded: CustomJwtPayload | string | JwtPayload | undefined) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" })
        return
      }

      ;(req as any).user = decoded as CustomJwtPayload
      next()
    }
  )
}
