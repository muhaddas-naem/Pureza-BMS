/**
 * Authentication & Security Middleware Layer
 *
 * Middleware Functions:
 * - authenticate(): Extracts & verifies JWT token from Bearer header or Cookie.
 * - authorize(): Enforces Role-Based Access Control (RBAC).
 * - verifyPermission(): Enforces fine-grained module permission requirements.
 * - securityHeaders(), rateLimiter(), csrfProtection(), corsHandler(): Production security protections.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, JwtUserPayload } from './jwt';
import { hasPermission, RoleName, SystemModule, PermissionAction } from './permissions';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * Extracts Bearer token from headers or cookies and attaches verified user payload to req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = '';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/access_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'অননুমোদিত এক্সেস! অনুগ্রহ করে লগইন করুন (Missing Auth Token)।',
      });
    }

    const payload = verifyJwtToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: `অথেন্টিকেশন ব্যর্থ হয়েছে: ${error.message || 'মেয়াদোত্তীর্ণ টোকেন'}`,
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Authorizer
 */
export function authorize(allowedRoles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'ইউজার লগইন সনাক্ত করা যায়নি।' });
    }

    if (!allowedRoles.includes(req.user.role as RoleName)) {
      return res.status(403).json({
        success: false,
        error: `এক্সেস প্রত্যাখ্যাত! এই অ্যাকশনের জন্য "${allowedRoles.join(' / ')}" রোল প্রয়োজন।`,
      });
    }

    next();
  };
}

/**
 * Fine-Grained Module Permission Authorizer
 */
export function verifyPermission(module: SystemModule, action: PermissionAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'ইউজার লগইন সনাক্ত করা যায়নি।' });
    }

    const permitted = hasPermission(req.user.role, module, action);
    if (!permitted) {
      return res.status(403).json({
        success: false,
        error: `এক্সেস প্রত্যাখ্যাত! "${module}" মডিউলে "${action}" করার অনুমতি আপনার নেই।`,
      });
    }

    next();
  };
}

/**
 * Sets basic Security Response Headers (Helmet compatible)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

/**
 * Simple In-Memory Rate Limiter for Login / Sensitive Endpoints
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'অত্যধিক রিকোয়েস্ট পাঠানো হয়েছে! অনুগ্রহ করে ১ মিনিট পর আবার চেষ্টা করুন।',
      });
    }

    next();
  };
}
