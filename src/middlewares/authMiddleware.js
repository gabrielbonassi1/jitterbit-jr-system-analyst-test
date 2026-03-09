// authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jitterbit_secret_key_2026';

/**
 * middleware to verify jwt token
 * expects token in authorization header: "Bearer <token>"
 * @param {import('express').Request} req - Request object
 * @param {import('express').Response} res - Response object
 * @param {import('express').NextFunction} next - Next function
 * @returns {void}
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

export default authenticateToken;
