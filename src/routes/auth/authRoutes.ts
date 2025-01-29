import express from 'express';
import { Router } from 'express';
import { login, register } from '../../controllers/authController';

const router: Router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/register', register);

export default router;