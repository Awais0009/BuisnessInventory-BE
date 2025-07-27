import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { CreateUserRequest, LoginRequest } from '../types';
import { query } from '../config/database';

const authService = new AuthService();

export class AuthController {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, full_name, business_name }: CreateUserRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }

      const { user, token } = await authService.register({
        email,
        password,
        full_name,
        business_name
      });

      // Remove sensitive information from response
      const userResponse = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        role: user.profile.role,
        phone: user.profile.phone,
        address: user.profile.address,
        is_active: user.profile.is_active,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Account created successfully. Please check your email to confirm your account.'
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create account'
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const { user, token } = await authService.login(email, password);

      // Remove sensitive information from response
      const userResponse = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        role: user.profile.role,
        phone: user.profile.phone,
        address: user.profile.address,
        is_active: user.profile.is_active,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.json({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Login successful'
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.message.includes('confirm your email')) {
        return res.status(403).json({
          success: false,
          error: error.message,
          code: 'EMAIL_NOT_CONFIRMED'
        });
      }
      
      if (error.message.includes('Invalid email or password') || error.message.includes('inactive')) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Get current user profile
  async profile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const user = await authService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Remove sensitive information from response
      const userResponse = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        role: user.profile.role,
        phone: user.profile.phone,
        address: user.profile.address,
        is_active: user.profile.is_active,
        avatar_url: user.profile.avatar_url,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.json({
        success: true,
        data: userResponse
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  // Verify token
  async verifyToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      const userResponse = {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        business_name: req.user.business_name,
        role: req.user.role
      };

      res.json({
        success: true,
        message: 'Token is valid',
        user: userResponse
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  }

  // Confirm email
  async confirmEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Confirmation token is required'
        });
      }

      await authService.confirmEmail(token);

      res.json({
        success: true,
        message: 'Email confirmed successfully'
      });

    } catch (error: any) {
      console.error('Email confirmation error:', error);
      
      if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Email confirmation failed'
      });
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      await authService.initiatePasswordReset(email);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process password reset request'
      });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Password reset failed'
      });
    }
  }

  // Resend confirmation email
  async resendConfirmation(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      await authService.resendConfirmationEmail(email);

      res.json({
        success: true,
        message: 'Confirmation email sent successfully'
      });

    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      
      if (error.message.includes('not found') || error.message.includes('already confirmed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to resend confirmation email'
      });
    }
  }

  // Logout (mainly for clearing server-side sessions if needed)
  async logout(req: Request, res: Response) {
    try {
      // Since we're using JWT, we don't need to do anything server-side
      // The frontend will remove the token from localStorage/cookies
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  // Test endpoint to check if auth is working
  async test(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Auth service is working',
      timestamp: new Date().toISOString()
    });
  }

  // Debug endpoint to check user status
  async debugUser(req: Request, res: Response) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email parameter is required'
        });
      }

      const userQuery = `
        SELECT 
          u.id,
          u.email,
          u.full_name,
          u.business_name,
          u.email_confirmed_at,
          u.confirmation_token,
          u.created_at,
          p.role,
          p.is_active
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.email = $1
      `;
      
      const result = await query(userQuery, [email.toString().toLowerCase()]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = result.rows[0];
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          business_name: user.business_name,
          email_confirmed: !!user.email_confirmed_at,
          email_confirmed_at: user.email_confirmed_at,
          has_confirmation_token: !!user.confirmation_token,
          created_at: user.created_at,
          role: user.role,
          is_active: user.is_active
        }
      });

    } catch (error) {
      console.error('Debug user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user debug info'
      });
    }
  }
}
