// Express route definitions for serving static pages and handling 404s
// Handles routes for home, about, students, login, and 404
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const router = express.Router();

// Home route
router.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../index.html')); // Serve the main HTML file
});

// About route
router.get('/about', (_req: Request, res: Response) => {
  res.send('<h1>About Page</h1><p>This is the About Page.</p>'); // Serve a simple About page
});

// Students page
router.get('/students', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../views/students.html')); // Serve the students HTML file
});

// Login page
router.get('/login', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../views/login.html')); // Serve the login HTML file
});

// Register page
router.get('/register', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../views/register.html')); // Serve the register HTML file
});

// Users page
router.get('/users', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../views/users.html')); // Serve the users HTML file
});

// Products page
router.get('/products', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../views/products.html')); // Serve the products HTML file
});

// API root page
router.get('/api', (_req: Request, res: Response) => {
  res.send(
    '<h1>API Home</h1><ul>' +
      '<li><a href="/api/users">/api/users</a> (API, not HTML)</li>' +
      '<li><a href="/api/products">/api/products</a> (API, not HTML)</li>' +
      '<li><a href="/api/orders">/api/orders</a> (API, not HTML)</li>' +
      '</ul>'
  );
});

// 404 handler
router.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).send('Page not found'); // Handle undefined routes with a 404 message
});

export default router;
