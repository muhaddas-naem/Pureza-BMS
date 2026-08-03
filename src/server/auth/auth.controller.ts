/**
 * Authentication Controller Layer
 *
 * Responsibilities:
 * - Express request handlers for all Authentication & Account endpoints.
 * - Extracts body payload, headers, cookies, and formats JSON responses.
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক।' });
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;

      const result = await authService.login(email, password, userAgent, ipAddress);

      // Set HTTP-only Cookie for security
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'সফলভাবে লগইন হয়েছে!',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const refreshToken = req.body?.refreshToken;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      res.clearCookie('access_token');
      return res.json({ success: true, message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে।' });
    } catch (error: any) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenStr = req.body.refreshToken;
      if (!refreshTokenStr) {
        return res.status(400).json({ success: false, error: 'রিফ্রেশ টোকেন প্রয়োজন।' });
      }

      const result = await authService.refreshToken(refreshTokenStr);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, error: error.message });
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: 'ইউজার মেমোরিতে পাওয়া যায়নি।' });

      const profile = await authService.getProfile(userId);
      return res.json({ success: true, data: profile });
    } catch (error: any) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: 'ইউজার মেমোরিতে পাওয়া যায়নি।' });

      const updated = await authService.updateProfile(userId, req.body);
      return res.json({ success: true, message: 'প্রোফাইল আপডেট হয়েছে!', data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'বর্তমান এবং নতুন পাসওয়ার্ড প্রদান করুন।' });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      return res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'ইমেইল অ্যাড্রেস প্রদান করুন।' });

      const result = await authService.requestPasswordReset(email);
      return res.json({
        success: true,
        message: 'পাসওয়ার্ড রিসেট টোকেন তৈরি করা হয়েছে।',
        resetToken: result.resetToken,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) {
        return res.status(400).json({ success: false, error: 'রিসেট টোকেন ও নতুন পাসওয়ার্ড দিন।' });
      }

      await authService.resetPassword(resetToken, newPassword);
      return res.json({ success: true, message: 'পাসওয়ার্ড রিসেট করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const authController = new AuthController();
