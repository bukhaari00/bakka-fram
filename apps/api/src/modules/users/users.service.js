import { hashPassword } from '../../utils/security.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';
import { ROLES } from '@bakka/shared';

export class UsersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listUsers({ farmId, search, role }) {
    const where = {};
    if (farmId) {
      where.farm_id = farmId;
    }

    if (role && role !== 'ALL') {
      where.role_name = role;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { full_name: { contains: q } },
        { email: { contains: q } },
        { username: { contains: q } },
        { phone: { contains: q } }
      ];
    }

    return await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        full_name: true,
        role_name: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getUserById({ farmId, userId }) {
    const where = { id: userId };
    if (farmId) where.farm_id = farmId;

    const user = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        full_name: true,
        role_name: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async createUser({ farmId, email, username, password, fullName, roleName, phone, req, actorUserId }) {
    if (!Object.values(ROLES).includes(roleName)) {
      throw new AppError(`Invalid role: ${roleName}. Allowed: ${Object.values(ROLES).join(', ')}`, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username ? username.toLowerCase().trim() : cleanEmail.split('@')[0];

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existingEmail) {
      throw new AppError('User with this email already exists.', 409);
    }

    if (cleanUsername) {
      const existingUser = await this.prisma.user.findFirst({
        where: { username: cleanUsername }
      });
      if (existingUser) {
        throw new AppError('User with this username already exists.', 409);
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        email: cleanEmail,
        username: cleanUsername,
        phone: phone ? phone.trim() : null,
        password_hash: passwordHash,
        full_name: fullName.trim(),
        role_name: roleName,
        is_active: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        full_name: true,
        role_name: true,
        is_active: true,
        created_at: true
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'USER_CREATED_BY_ADMIN',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, username: user.username, role: user.role_name, fullName: user.full_name },
      req
    });

    return user;
  }

  async updateUser({ farmId, userId, fullName, username, roleName, phone, req, actorUserId }) {
    const where = { id: userId };
    if (farmId) where.farm_id = farmId;

    const existing = await this.prisma.user.findFirst({ where });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (roleName && !Object.values(ROLES).includes(roleName)) {
      throw new AppError(`Invalid role: ${roleName}`, 400);
    }

    // Prevent non-admin promotion or unauthorized changes
    if (roleName === 'ADMIN' && existing.role_name !== 'ADMIN') {
      // Must be admin actor
      const actor = await this.prisma.user.findUnique({ where: { id: actorUserId } });
      if (actor?.role_name !== 'ADMIN') {
        throw new AppError('Only administrators can promote users to Administrator.', 403);
      }
    }

    if (username && username.toLowerCase().trim() !== existing.username) {
      const cleanUsername = username.toLowerCase().trim();
      const duplicate = await this.prisma.user.findFirst({
        where: { username: cleanUsername, NOT: { id: userId } }
      });
      if (duplicate) {
        throw new AppError('Username is already taken by another account.', 409);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: fullName !== undefined ? fullName.trim() : existing.full_name,
        username: username !== undefined ? username.toLowerCase().trim() : existing.username,
        role_name: roleName || existing.role_name,
        phone: phone !== undefined ? phone : existing.phone,
        version: { increment: 1 }
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        full_name: true,
        role_name: true,
        is_active: true,
        updated_at: true
      }
    });

    await logAudit(this.prisma, {
      farmId: existing.farm_id,
      userId: actorUserId,
      action: 'USER_UPDATED_BY_ADMIN',
      entityType: 'User',
      entityId: userId,
      oldValues: { fullName: existing.full_name, role: existing.role_name, phone: existing.phone },
      newValues: { fullName: updated.full_name, role: updated.role_name, phone: updated.phone },
      req
    });

    return updated;
  }

  async toggleActiveStatus({ farmId, userId, isActive, req, actorUserId }) {
    const where = { id: userId };
    if (farmId) where.farm_id = farmId;

    const existing = await this.prisma.user.findFirst({ where });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    // Do not allow an admin to deactivate themselves
    if (existing.id === actorUserId && !isActive) {
      throw new AppError('You cannot deactivate your own account.', 400);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        is_active: isActive,
        version: { increment: 1 }
      },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        role_name: true,
        is_active: true,
        updated_at: true
      }
    });

    // If deactivated, revoke all active sessions immediately
    if (!isActive) {
      await this.prisma.session.deleteMany({
        where: { user_id: userId }
      }).catch(() => {});
    }

    await logAudit(this.prisma, {
      farmId: existing.farm_id,
      userId: actorUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: userId,
      oldValues: { isActive: existing.is_active },
      newValues: { isActive: updated.is_active },
      req
    });

    return updated;
  }

  async resetPassword({ farmId, userId, newPassword, req, actorUserId }) {
    const where = { id: userId };
    if (farmId) where.farm_id = farmId;

    const existing = await this.prisma.user.findFirst({ where });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    const passwordHash = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: passwordHash,
        version: { increment: 1 }
      }
    });

    // Invalidate sessions on password reset
    await this.prisma.session.deleteMany({
      where: { user_id: userId }
    }).catch(() => {});

    await logAudit(this.prisma, {
      farmId: existing.farm_id,
      userId: actorUserId,
      action: 'USER_PASSWORD_RESET_BY_ADMIN',
      entityType: 'User',
      entityId: userId,
      req
    });

    return { success: true, message: 'Password has been successfully reset.' };
  }

  async deleteUser({ farmId, userId, req, actorUserId }) {
    const where = { id: userId };
    if (farmId) where.farm_id = farmId;

    const existing = await this.prisma.user.findFirst({ where });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (existing.id === actorUserId) {
      throw new AppError('You cannot delete your own account.', 400);
    }

    // Invalidate sessions & devices
    await this.prisma.session.deleteMany({ where: { user_id: userId } }).catch(() => {});
    await this.prisma.userDevice.deleteMany({ where: { user_id: userId } }).catch(() => {});
    await this.prisma.user.delete({ where: { id: userId } });

    await logAudit(this.prisma, {
      farmId: existing.farm_id,
      userId: actorUserId,
      action: 'USER_DELETED_BY_ADMIN',
      entityType: 'User',
      entityId: userId,
      oldValues: { email: existing.email, role: existing.role_name, fullName: existing.full_name },
      req
    });

    return { success: true, message: 'User deleted successfully.' };
  }
}
