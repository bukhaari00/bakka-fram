import { v4 as uuidv4 } from 'uuid';

/**
 * Record an audit log entry in MySQL
 */
export async function logAudit(prisma, {
  farmId,
  userId,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null
}) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    return await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values_json: oldValues ? JSON.stringify(oldValues) : null,
        new_values_json: newValues ? JSON.stringify(newValues) : null,
        ip_address: ipAddress ? String(ipAddress).slice(0, 45) : null,
        user_agent: userAgent ? String(userAgent).slice(0, 255) : null
      }
    });
  } catch (err) {
    console.error('[AuditLogError] Failed to record audit log:', err);
    // Never crash the primary transaction because of audit log failure, but log securely
    return null;
  }
}
