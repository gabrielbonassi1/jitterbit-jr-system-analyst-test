// server.js - application entry point
// npm run start starts from here

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  updateOrderController,
  deleteOrderController
} from './controllers/order.controller.js';
import { login, getCurrentUser } from './controllers/auth.controller.js';
import authenticateToken from './middlewares/authMiddleware.js';

// load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// authentication routes (public - no JWT required)
app.post('/auth/login', login);

// protected authentication routes (JWT required)
app.get('/auth/me', authenticateToken, getCurrentUser);

// order routes (all protected with JWT)
// POST /order - create new order (required)
app.post('/order', authenticateToken, createOrderController);

// GET /order/list - get all orders (optional) - must be before /:orderId
app.get('/order/list', authenticateToken, getAllOrdersController);

// GET /order/:orderId - get order by id (required)
app.get('/order/:orderId', authenticateToken, getOrderByIdController);

// PUT /order/:orderId - update order (optional)
app.put('/order/:orderId', authenticateToken, updateOrderController);

// DELETE /order/:orderId - delete order (optional)
app.delete('/order/:orderId', authenticateToken, deleteOrderController);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Public Endpoints:`);
  console.log(`- GET    /health`);
  console.log(`- POST   /auth/login`);
  console.log(`Protected Endpoints (JWT required):`);
  console.log(`- GET    /auth/me`);
  console.log(`- POST   /order`);
  console.log(`- GET    /order/:orderId`);
  console.log(`- GET    /order/list`);
  console.log(`- PUT    /order/:orderId`);
  console.log(`- DELETE /order/:orderId`);
  console.log('REMINDER: Credentials are defined at README.md');
});

export default app;
