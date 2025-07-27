import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, getClient } from '../config/database';
import { User, Profile } from '../types';

export interface UserWithProfile extends User {
  profile: Profile;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly saltRounds = 12;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '';
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  // Generate JWT token
  generateToken(userId: string, email: string): string {
    const payload = { userId, email };
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d'; // Extended to 30 days
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as any);
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate random token for email confirmation/reset
  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register new user
  async register(userData: {
    email: string;
    password: string;
    full_name?: string;
    business_name?: string;
  }): Promise<{ user: UserWithProfile; token: string }> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT email FROM auth.users WHERE email = $1',
        [userData.email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);
      
      // Generate confirmation token
      const confirmationToken = this.generateRandomToken();

      // Insert user
      const userInsertQuery = `
        INSERT INTO auth.users (
          email, 
          encrypted_password, 
          full_name, 
          business_name,
          confirmation_token,
          confirmation_sent_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
        RETURNING *
      `;

      const userResult = await client.query(userInsertQuery, [
        userData.email.toLowerCase(),
        hashedPassword,
        userData.full_name || '',
        userData.business_name || '',
        confirmationToken
      ]);

      const user = userResult.rows[0];

      // Create profile
      const profileInsertQuery = `
        INSERT INTO public.profiles (
          user_id,
          role,
          is_active,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;

      const profileResult = await client.query(profileInsertQuery, [
        user.id,
        'admin', // Default role
        true
      ]);

      const profile = profileResult.rows[0];

      await client.query('COMMIT');

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      // Send confirmation email
      try {
        const { EmailService } = await import('./emailService');
        const emailService = new EmailService();
        const emailSent = await emailService.sendConfirmationEmail(user.email, confirmationToken);
        
        if (emailSent) {
          console.log(`✅ Confirmation email sent to ${user.email}`);
        } else {
          console.log(`⚠️ Failed to send confirmation email to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Don't fail registration if email fails, just log
        console.log(`📧 Email confirmation token for ${user.email}: ${confirmationToken}`);
        console.log(`🔗 Confirmation URL: ${process.env.FRONTEND_URL}/auth/callback?token=${confirmationToken}&type=email_confirmation`);
      }

      return {
        user: { ...user, profile },
        token
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: UserWithProfile; token: string }> {
    try {
      // Get user with profile
      const userQuery = `
        SELECT 
          u.*,
          p.profile_id,
          p.avatar_url,
          p.role,
          p.phone,
          p.address,
          p.is_active
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.email = $1
      `;

      const result = await query(userQuery, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.encrypted_password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        throw new Error('Please confirm your email address before logging in. Check your email for the confirmation link.');
      }

      // Check if account is active
      if (!user.is_active) {
        throw new Error('Account is inactive. Please contact support.');
      }

      // Update last sign in
      await query(
        'UPDATE auth.users SET last_sign_in_at = NOW(), updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      // Structure the response
      const userResponse = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          profile_id: user.profile_id,
          user_id: user.id,
          avatar_url: user.avatar_url,
          role: user.role,
          phone: user.phone,
          address: user.address,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      };

      return {
        user: userResponse as UserWithProfile,
        token
      };

    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserWithProfile | null> {
    try {
      const userQuery = `
        SELECT 
          u.*,
          p.profile_id,
          p.avatar_url,
          p.role,
          p.phone,
          p.address,
          p.is_active
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `;

      const result = await query(userQuery, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        encrypted_password: user.encrypted_password,
        email_confirmed_at: user.email_confirmed_at,
        confirmation_token: user.confirmation_token,
        confirmation_sent_at: user.confirmation_sent_at,
        recovery_token: user.recovery_token,
        recovery_sent_at: user.recovery_sent_at,
        email_change_token_new: user.email_change_token_new,
        email_change: user.email_change,
        email_change_sent_at: user.email_change_sent_at,
        last_sign_in_at: user.last_sign_in_at,
        raw_app_meta_data: user.raw_app_meta_data,
        raw_user_meta_data: user.raw_user_meta_data,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          profile_id: user.profile_id,
          user_id: user.id,
          avatar_url: user.avatar_url,
          role: user.role,
          phone: user.phone,
          address: user.address,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      } as UserWithProfile;

    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Confirm email
  async confirmEmail(token: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM auth.users WHERE confirmation_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired confirmation token');
      }

      const userId = result.rows[0].id;

      // Update user as confirmed
      await query(
        `UPDATE auth.users 
         SET email_confirmed_at = NOW(), 
             confirmation_token = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [userId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Send password reset email
  async initiatePasswordReset(email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM auth.users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        // Don't reveal that email doesn't exist
        return true;
      }

      const userId = result.rows[0].id;
      const resetToken = this.generateRandomToken();

      // Update user with reset token
      await query(
        `UPDATE auth.users 
         SET recovery_token = $1, 
             recovery_sent_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [resetToken, userId]
      );

      // TODO: Send password reset email here
      console.log(`📧 Password reset token for ${email}: ${resetToken}`);
      console.log(`🔗 Reset URL: ${process.env.FRONTEND_URL}/auth/callback?token=${resetToken}&type=password_reset`);

      return true;
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM auth.users WHERE recovery_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const userId = result.rows[0].id;
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token
      await query(
        `UPDATE auth.users 
         SET encrypted_password = $1, 
             recovery_token = NULL,
             recovery_sent_at = NULL,
             updated_at = NOW()
         WHERE id = $2`,
        [hashedPassword, userId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Resend confirmation email
  async resendConfirmationEmail(email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id, email_confirmed_at FROM auth.users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      if (user.email_confirmed_at) {
        throw new Error('Email is already confirmed');
      }

      const confirmationToken = this.generateRandomToken();

      // Update confirmation token
      await query(
        `UPDATE auth.users 
         SET confirmation_token = $1, 
             confirmation_sent_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [confirmationToken, user.id]
      );

      // Send confirmation email
      try {
        const { EmailService } = await import('./emailService');
        const emailService = new EmailService();
        const emailSent = await emailService.sendConfirmationEmail(email, confirmationToken);
        
        if (emailSent) {
          console.log(`✅ Confirmation email resent to ${email}`);
        } else {
          console.log(`⚠️ Failed to resend confirmation email to ${email}`);
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }

      // Always show the token in console for development
      console.log(`📧 New confirmation token for ${email}: ${confirmationToken}`);
      console.log(`🔗 Confirmation URL: ${process.env.FRONTEND_URL}/auth/callback?token=${confirmationToken}&type=email_confirmation`);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verify JWT token
  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
