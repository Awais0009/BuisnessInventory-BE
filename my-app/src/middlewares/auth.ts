import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name?: string;
        business_name?: string;
        role: string;
        profile_id: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Get user details from database
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.business_name,
        u.email_confirmed_at,
        p.profile_id,
        p.role,
        p.is_active
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `;
    
    const result = await query(userQuery, [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    
    // Check if user account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      business_name: user.business_name,
      role: user.role,
      profile_id: user.profile_id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.business_name,
        p.profile_id,
        p.role,
        p.is_active
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      WHERE u.id = $1 AND p.is_active = true
    `;
    
    const result = await query(userQuery, [decoded.userId]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        role: user.role,
        profile_id: user.profile_id
      };
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
