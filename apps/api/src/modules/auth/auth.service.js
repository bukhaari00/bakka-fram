import { hashPassword, verifyPassword } from '../../utils/security.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { generateToken, hashToken } from '../../utils/response.js';
import { logAudit } from '../../utils/audit.js';
import { config } from '../../config/index.js';
import { ROLES, ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';

export class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Helper to resolve or create the default farm
   */
  async getOrCreateDefaultFarm() {
    let farm = await this.prisma.farm.findFirst({
      orderBy: { created_at: 'asc' }
    });

    if (!farm) {
      farm = await this.prisma.farm.create({
        data: {
          id: uuidv4(),
          name: 'Bakka Operations',
          code: 'BAKKA-01',
          currency: 'USD',
          timezone: 'Africa/Mogadishu',
          default_language: 'en'
        }
      });
    }

    return farm;
  }

  /**
   * Online login using email or username, and password
   * Supports Remember Me (30 days vs 7 days session)
   */
  async login({ email, username, identifier, password, rememberMe, deviceId, deviceName, req }) {
    const loginId = (identifier || email || username || '').toLowerCase().trim();

    if (!loginId) {
      throw new AppError('Email or username is required.', 400);
    }

    // Try finding by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { username: loginId }
        ]
      },
      include: { farm: true }
    });

    if (!user) {
      throw new AppError('Invalid email/username or password.', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await verifyPassword(user.password_hash, password);
    if (!isMatch) {
      throw new AppError('Invalid email/username or password.', 401);
    }

    // Generate Session (30 days if rememberMe, else 7 days)
    const sessionDays = rememberMe ? 30 : 7;
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * sessionDays);

    const session = await this.prisma.session.create({
      data: {
        id: uuidv4(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null,
        user_agent: req ? (req.headers['user-agent'] || null) : null
      }
    });

    // Handle Device enrollment / update if deviceId provided
    let enrolledDevice = null;
    if (deviceId) {
      enrolledDevice = await this.prisma.userDevice.upsert({
        where: { device_id: deviceId },
        update: {
          user_id: user.id,
          device_name: deviceName || 'Browser Device',
          last_sync_at: new Date(),
          is_revoked: false
        },
        create: {
          id: uuidv4(),
          user_id: user.id,
          device_id: deviceId,
          device_name: deviceName || 'Browser Device',
          last_sync_at: new Date()
        }
      });
    }

    // Audit Login
    await logAudit(this.prisma, {
      farmId: user.farm_id,
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, username: user.username, role: user.role_name },
      req
    });

    return {
      token: rawToken,
      expiresAt,
      user: {
        id: user.id,
        farmId: user.farm_id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        roleName: user.role_name,
        phone: user.phone,
        permissions: ROLE_DEFAULT_PERMISSIONS[user.role_name] || []
      },
      farm: user.farm,
      device: enrolledDevice
    };
  }

  /**
   * User Registration System
   * - Validates all fields
   * - Prevents duplicate email and usernames
   * - Hashes password using Argon2id
   * - Prevents public ADMIN/MANAGER creation (defaults to STUDENT or CUSTOMER)
   */
  async register({ fullName, email, username, phone, password, role, req }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username ? username.toLowerCase().trim() : cleanEmail.split('@')[0];

    // Check email uniqueness
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // Check username uniqueness
    if (cleanUsername) {
      const existingUsername = await this.prisma.user.findFirst({
        where: { username: cleanUsername }
      });
      if (existingUsername) {
        throw new AppError('This username is already taken. Please choose another one.', 409);
      }
    }

    const farm = await this.getOrCreateDefaultFarm();
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Public registration ALWAYS assigns STUDENT role unconditionally on backend.
    // Public frontend cannot supply or override this role.
    const roleName = ROLES.STUDENT;

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        farm_id: farm.id,
        email: cleanEmail,
        username: cleanUsername,
        phone: phone ? phone.trim() : null,
        password_hash: passwordHash,
        full_name: fullName.trim(),
        role_name: roleName,
        is_active: true
      },
      include: { farm: true }
    });

    // Generate active session
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await this.prisma.session.create({
      data: {
        id: uuidv4(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null,
        user_agent: req ? (req.headers['user-agent'] || null) : null
      }
    });

    await logAudit(this.prisma, {
      farmId: farm.id,
      userId: user.id,
      action: 'AUTH_REGISTER_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, username: user.username, role: roleName },
      req
    });

    return {
      token: rawToken,
      expiresAt,
      user: {
        id: user.id,
        farmId: user.farm_id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        roleName: user.role_name,
        phone: user.phone,
        permissions: ROLE_DEFAULT_PERMISSIONS[roleName] || []
      },
      farm: user.farm
    };
  }

  /**
   * Forgot Password request
   */
  async forgotPassword({ identifier, req }) {
    const cleanId = identifier.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { username: cleanId }
        ]
      }
    });

    if (user) {
      await logAudit(this.prisma, {
        farmId: user.farm_id,
        userId: user.id,
        action: 'AUTH_FORGOT_PASSWORD_REQUEST',
        entityType: 'User',
        entityId: user.id,
        newValues: { identifier: cleanId },
        req
      });
    }

    // Always return safe success message to prevent user enumeration
    return {
      success: true,
      message: 'If an account exists with that email or username, password reset instructions have been generated.'
    };
  }

  /**
   * Enroll a device for offline authentication
   */
  async enrollDevice({ userId, deviceId, deviceName, offlineVerifierHash, offlineVerifierSalt, req }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { farm: true }
    });

    if (!user || !user.is_active) {
      throw new AppError('Cannot enroll device for inactive or nonexistent user.', 403);
    }

    const device = await this.prisma.userDevice.upsert({
      where: { device_id: deviceId },
      update: {
        user_id: user.id,
        device_name: deviceName || 'Offline Enrolled Device',
        offline_verifier_hash: offlineVerifierHash,
        offline_verifier_salt: offlineVerifierSalt,
        is_revoked: false,
        last_sync_at: new Date()
      },
      create: {
        id: uuidv4(),
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName || 'Offline Enrolled Device',
        offline_verifier_hash: offlineVerifierHash,
        offline_verifier_salt: offlineVerifierSalt,
        last_sync_at: new Date()
      }
    });

    await logAudit(this.prisma, {
      farmId: user.farm_id,
      userId: user.id,
      action: 'DEVICE_ENROLLED_OFFLINE',
      entityType: 'UserDevice',
      entityId: device.id,
      newValues: { deviceId, deviceName },
      req
    });

    return {
      enrolled: true,
      deviceId: device.device_id,
      enrolledAt: device.enrolled_at,
      offlineExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    };
  }

  /**
   * Terminate current session
   */
  async logout({ sessionId, userId, farmId, req }) {
    if (sessionId) {
      await this.prisma.session.delete({
        where: { id: sessionId }
      }).catch(() => {});
    }

    if (userId && farmId) {
      await logAudit(this.prisma, {
        farmId,
        userId,
        action: 'AUTH_LOGOUT',
        entityType: 'Session',
        entityId: sessionId || userId,
        req
      });
    }

    return { success: true };
  }
}
