// Express route definitions for authentication endpoints
import express from 'express';
import * as authController from '../controllers/authController';
import validateRequest from '../middleware/validationMiddleware';
import { userLoginSchema } from '../validation/userValidation';

const router = express.Router();

// Login route
router.post('/login', validateRequest(userLoginSchema), authController.login);
// Logout route
router.post('/logout', authController.logout);

export default router;
