// Load .env FIRST so JWT_SECRET / MONGO_URI exist before other modules read them
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import contentType from './middleware/contentType.js';
import notFound from './middleware/notFound.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Fail fast if the secret is missing - never fall back to a hardcoded one
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

// Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pipeline (order matters)
app.use(cors());
app.use(logger);        // 1. log every incoming request
app.use(contentType);   // 2. reject non-JSON POST/PUT before parsing
app.use(express.json()); // 3. parse the JSON body

// Root route - API Welcome
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Task Management RESTful API (JWT Auth + MongoDB)',
    version: '4.0.0',
    endpoints: {
      'POST /api/auth/register': 'Register a new user (public)',
      'POST /api/auth/login': 'Log in and receive a JWT (public)',
      'GET /api/auth/me': 'Current user details (protected)',
      'GET /api/tasks': 'Get all tasks of the user (protected)',
      'GET /api/tasks/:id': 'Get a specific task (protected)',
      'POST /api/tasks': 'Create a new task (protected)',
      'PUT /api/tasks/:id': 'Update a task (protected)',
      'DELETE /api/tasks/:id': 'Delete a task (protected)'
    },
    auth: 'Send header  Authorization: Bearer <token>  on protected routes',
    documentation: 'See README.md for full API documentation'
  });
});

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected task routes (auth middleware applied inside the router)
app.use('/api/tasks', taskRoutes);

// 404 Handler for undefined routes (after all routes)
app.use(notFound);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
