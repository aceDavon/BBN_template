import express from "express"
import { Router } from "express"
import {
  login,
  register,
  updateUser,
  logout,
  getUsers,
  deleteUser,
} from "../../controllers/authController"
import { authenticateToken } from "src/middleware/authMiddleware"

const router: Router = express.Router()

router.post("/login", login)
router.post("/register", register)

// Authentication routes
router.patch("/", authenticateToken, updateUser)
router.get("/", authenticateToken, getUsers)
router.post("/logout", authenticateToken, logout)
router.delete('/', authenticateToken, deleteUser)

export default router
