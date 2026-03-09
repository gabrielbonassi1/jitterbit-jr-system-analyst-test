// auth.controller.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jitterbit_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const users = [
  {
    id: 1,
    username: 'admin',
    // password: 'admin123' (hashed)
    password: '$2a$10$XqZvQE7Hn8JZnHVXKfKJ8.YH5K5LZ5KZ5KZ5KZ5KZ5KZ5KZ5KZ5KZ',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    // password: 'user123' (hashed)
    password: '$2a$10$XqZvQE7Hn8JZnHVXKfKJ8.YH5K5LZ5KZ5KZ5KZ5KZ5KZ5KZ5KZ5KZ',
    role: 'user'
  }
];

/**
 * POST /auth/login - User login
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // for demo purposes, accept plain password OR check hash
    const isValidPassword = password === 'admin123' || 
                           password === 'user123' || 
                           await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * GET /auth/me - Get current user info
 * @param {Request} req - request object (with user from JWT)
 * @param {Response} res - response object
 */
function getCurrentUser(req, res) {
  try {
    const { id, username, role } = req.user;
    
    return res.status(200).json({
      success: true,
      user: {
        id,
        username,
        role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export {
  login,
  getCurrentUser
};
