import jwt from "jsonwebtoken"

export const generateToken = (payload: object, secret: string): string => {
  return jwt.sign(payload, secret, { expiresIn: "12h" })
}
