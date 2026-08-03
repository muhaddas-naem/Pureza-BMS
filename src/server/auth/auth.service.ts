/**
 * Core Authentication & User Account Service
 *
 * Responsibilities:
 * - Credentials verification and password matching
 * - Session tracking and refresh token lifecycle management
 * - Password resets, profile updates, and login attempt auditing
 */

import crypto from 'crypto';
import { userRepository } from '../repositories/UserRepository';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';
import { hashPassword, comparePassword, validatePasswordStrength } from './password';
import { signJwtToken, verifyJwtToken, JwtUserPayload } from './jwt';
import { config } from '../../config';
import { User } from '../../types';

export interface LoginResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}

export interface LoginLogRecord {
  id: string;
  userId?: string;
  email: string;
  status: 'Success' | 'Failed_Password' | 'User_Not_Found' | 'Inactive_Account';
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export class AuthService {
  private sessionsTable = TABLE_NAMES.USER_SESSIONS;
  private logsTable = TABLE_NAMES.LOGIN_LOGS;

  /**
   * Authenticates user email & password credentials
   */
  public async login(
    email: string,
    plainPass: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<LoginResult> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user) {
      await this.logAttempt(cleanEmail, 'User_Not_Found', undefined, ipAddress, userAgent);
      throw new Error('ইনভ্যালিড ইমেইল অথবা পাসওয়ার্ড!');
    }

    if (user.status === 'Inactive') {
      await this.logAttempt(cleanEmail, 'Inactive_Account', user.id, ipAddress, userAgent);
      throw new Error('আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।');
    }

    // Default seed fallback check
    const isPasswordValid = comparePassword(plainPass, user.password || '123456');
    if (!isPasswordValid) {
      await this.logAttempt(cleanEmail, 'Failed_Password', user.id, ipAddress, userAgent);
      throw new Error('ইনভ্যালিড ইমেইল অথবা পাসওয়ার্ড!');
    }

    // Generate tokens
    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'Staff',
      type: 'access',
    };

    const accessToken = signJwtToken(payload, config.jwtExpiresIn);
    const refreshToken = signJwtToken({ ...payload, type: 'refresh' }, config.jwtRefreshExpiresIn);

    // Save active session
    await this.createSession(user.id, refreshToken, userAgent, ipAddress);
    await this.logAttempt(cleanEmail, 'Success', user.id, ipAddress, userAgent);

    // Update last active
    await userRepository.update(user.id, { lastActive: 'Just now' });

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpiresIn,
    };
  }

  /**
   * Refreshes access token using valid refresh token
   */
  public async refreshToken(refreshTokenStr: string): Promise<{ accessToken: string }> {
    const payload = verifyJwtToken(refreshTokenStr);
    if (payload.type !== 'refresh') {
      throw new Error('ইনভ্যালিড রিফ্রেশ টোকেন!');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.status === 'Inactive') {
      throw new Error('ইউজার অ্যাকাউন্ট নিষ্ক্রিয় বা পাওয়া যায়নি।');
    }

    const newAccessToken = signJwtToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'Staff',
        type: 'access',
      },
      config.jwtExpiresIn
    );

    return { accessToken: newAccessToken };
  }

  /**
   * Logs out user and revokes active refresh token session
   */
  public async logout(userId: string, refreshTokenStr?: string): Promise<boolean> {
    const storage = dbConnection.getStorage();
    const sessions = (storage.get(this.sessionsTable) || []) as UserSessionRecord[];

    const filtered = sessions.filter((s) => s.userId !== userId || (refreshTokenStr && s.refreshToken !== refreshTokenStr));
    storage.set(this.sessionsTable, filtered);
    return true;
  }

  /**
   * Returns current user profile details
   */
  public async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ইউজার অ্যাকাউন্ট পাওয়া যায়নি।');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Updates user profile info
   */
  public async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>
  ): Promise<Omit<User, 'password'>> {
    const updated = await userRepository.update(userId, updates);
    if (!updated) throw new Error('প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  /**
   * Changes current user password securely
   */
  public async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ইউজার পাওয়া যায়নি।');

    const isValid = comparePassword(currentPass, user.password || '123456');
    if (!isValid) throw new Error('বর্তমান পাসওয়ার্ড ভুল দেওয়া হয়েছে!');

    const strength = validatePasswordStrength(newPass);
    if (!strength.isValid) throw new Error(strength.message);

    const hashed = hashPassword(newPass);
    await userRepository.update(userId, { password: hashed });
    return true;
  }

  /**
   * Creates a password reset token for forgot password flow
   */
  public async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) throw new Error('এই ইমেইলে কোনো রেজিস্টার্ড ইউজার পাওয়া যায়নি।');

    const resetToken = signJwtToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: 'reset',
      },
      '1h'
    );

    return { resetToken };
  }

  /**
   * Resets password using valid reset token
   */
  public async resetPassword(resetToken: string, newPass: string): Promise<boolean> {
    const payload = verifyJwtToken(resetToken);
    if (payload.type !== 'reset') throw new Error('ইনভ্যালিড রিসেট টোকেন!');

    const strength = validatePasswordStrength(newPass);
    if (!strength.isValid) throw new Error(strength.message);

    const hashed = hashPassword(newPass);
    await userRepository.update(payload.userId, { password: hashed });
    return true;
  }

  /**
   * Session Management & Auditing Helpers
   */
  private async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserSessionRecord> {
    const storage = dbConnection.getStorage();
    const sessions = (storage.get(this.sessionsTable) || []) as UserSessionRecord[];

    const newSession: UserSessionRecord = {
      id: `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    sessions.push(newSession);
    storage.set(this.sessionsTable, sessions);
    return newSession;
  }

  private async logAttempt(
    email: string,
    status: LoginLogRecord['status'],
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const storage = dbConnection.getStorage();
    const logs = (storage.get(this.logsTable) || []) as LoginLogRecord[];

    logs.unshift({
      id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      userId,
      email,
      status,
      ipAddress,
      userAgent,
      timestamp: new Date().toLocaleString(),
    });

    storage.set(this.logsTable, logs);
  }
}

export const authService = new AuthService();
