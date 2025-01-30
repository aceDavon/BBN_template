import express from "express"
import { Router } from "express"
import {
  login,
  register,
  update,
  logout,
  getUsers,
} from "../../controllers/authController"
import { authenticateToken } from "src/middleware/authMiddleware"

const router: Router = express.Router()

router.post("/login", login)
router.post("/register", register)

// Authentication routes
router.patch("/", authenticateToken, update)
router.get("/", authenticateToken, getUsers)
router.post("/logout", authenticateToken, logout)

export default router
