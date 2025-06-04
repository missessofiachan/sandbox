// Express route definitions for database monitoring endpoints
import express from 'express';
import * as databaseController from '../controllers/databaseController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PoolStats:
 *       type: object
 *       properties:
 *         active:
 *           type: integer
 *           example: 5
 *         idle:
 *           type: integer
 *           example: 2
 *         total:
 *           type: integer
 *           example: 7
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message."
 *
 * /api/database/pool-stats:
 *   get:
 *     summary: Get database pool statistics
 *     tags:
 *       - Database
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pool statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PoolStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error."
 *
 * /api/database/reset-pools:
 *   post:
 *     summary: Reset database connection pools
 *     tags:
 *       - Database
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pools reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connection pools reset successfully."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error."
 */

// Only allow admins to access database pool statistics and management
// GET /api/database/pool-stats - Get detailed connection pool statistics
router.get('/pool-stats', authMiddleware, databaseController.getPoolStatistics);

// POST /api/database/reset-pools - Reset connection pools
router.post(
  '/reset-pools',
  authMiddleware,
  databaseController.resetConnectionPools
);

export default router;
