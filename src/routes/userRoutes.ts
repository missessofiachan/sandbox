// Express route definitions for user CRUD operations
import express from 'express';
import * as userController from '../controllers/userController';
import authMiddleware, { requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new user (registration, public)
router.post('/', userController.createUser);
// Get all users (admin only)
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
// Get a single user by ID (admin only)
router.get('/:id', authMiddleware, requireAdmin, userController.getUserById);
// Update a user by ID (admin only)
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
// Partially update a user by ID (admin only)
router.patch('/:id', authMiddleware, requireAdmin, userController.partialUpdateUser);
// Delete a user by ID (admin only)
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);

export default router;
