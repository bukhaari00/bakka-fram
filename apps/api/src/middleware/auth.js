import { AppError } from './errorHandler.js';
import { hashToken } from '../utils/response.js';
import { ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';

/**
 * Authentication Middleware
 * Extracts bearer token, checks active session and user status
 */
export function createAuthMiddleware(prisma) {
  return async function authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required. Missing or invalid Bearer token.', 401);
      }

      const rawToken = authHeader.split(' ')[1];
      const tokenHash = hashToken(rawToken);

      const session = await prisma.session.findUnique({
        where: { token_hash: tokenHash },
        include: {
          user: {
            include: {
              farm: true
            }
          }
        }
      });

      if (!session) {
        throw new AppError('Invalid or expired session token.', 401);
      }

      if (session.expires_at < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        throw new AppError('Session expired. Please log in again.', 401);
      }

      if (!session.user.is_active) {
        throw new AppError('User account is deactivated. Contact farm administrator.', 403);
      }

      // Attach user & farm context to request
      req.user = {
        id: session.user.id,
        farmId: session.user.farm_id,
        email: session.user.email,
        fullName: session.user.full_name,
        roleName: session.user.role_name,
        permissions: ROLE_DEFAULT_PERMISSIONS[session.user.role_name] || []
      };
      req.farm = session.user.farm;
      req.sessionId = session.id;

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Authorize specific permission
 */
export function requirePermission(permissionCode) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.roleName === 'ADMIN') {
      return next();
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return next(new AppError(`Forbidden: Missing permission [${permissionCode}]`, 403));
    }

    next();
  };
}

/**
 * Authorize allowed roles
 */
export function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Admin has superuser authority across all protected role endpoints
    if (req.user.roleName === 'ADMIN') {
      return next();
    }

    // Support MANAGER alias for FARM_MANAGER
    const userRole = req.user.roleName;
    const isAllowed = allowedRoles.includes(userRole) ||
      (userRole === 'FARM_MANAGER' && allowedRoles.includes('MANAGER')) ||
      (userRole === 'MANAGER' && allowedRoles.includes('FARM_MANAGER'));

    if (!isAllowed) {
      return next(new AppError(`Forbidden: Role [${req.user.roleName}] is not permitted for this action`, 403));
    }

    next();
  };
}
